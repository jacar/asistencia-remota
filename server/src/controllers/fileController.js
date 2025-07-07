const multer = require("multer")
const path = require("path")
const fs = require("fs").promises
const { v4: uuidv4 } = require("uuid")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads")
    try {
      await fs.mkdir(uploadPath, { recursive: true })
      cb(null, uploadPath)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow most file types, but exclude potentially dangerous ones
    const dangerousExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".com"]
    const fileExtension = path.extname(file.originalname).toLowerCase()

    if (dangerousExtensions.includes(fileExtension)) {
      return cb(new Error("File type not allowed for security reasons"))
    }

    cb(null, true)
  },
})

class FileController {
  // Get upload middleware
  static getUploadMiddleware() {
    return upload.single("file")
  }

  // Upload file
  static async uploadFile(req, res) {
    try {
      const userId = req.user.userId
      const { sessionId } = req.body

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" })
      }

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" })
      }

      // Verify user is part of the session
      const session = await req.prisma.session.findFirst({
        where: {
          id: sessionId,
          isActive: true,
          OR: [{ hostId: userId }, { guestId: userId }],
        },
      })

      if (!session) {
        // Delete uploaded file if session is invalid
        await fs.unlink(req.file.path).catch(console.error)
        return res.status(404).json({ error: "Session not found or inactive" })
      }

      // Check if file transfer is allowed
      if (!session.allowFileTransfer) {
        await fs.unlink(req.file.path).catch(console.error)
        return res.status(403).json({ error: "File transfer not allowed in this session" })
      }

      // Save file record to database
      const fileRecord = await req.prisma.file.create({
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          path: req.file.path,
          uploaderId: userId,
          sessionId: sessionId,
        },
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      })

      res.status(201).json({
        message: "File uploaded successfully",
        file: fileRecord,
      })
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error)
      }

      console.error("Upload file error:", error)

      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "File too large" })
      }

      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Download file
  static async downloadFile(req, res) {
    try {
      const userId = req.user.userId
      const { fileId } = req.params

      // Find file and verify access
      const file = await req.prisma.file.findFirst({
        where: {
          id: fileId,
          session: {
            OR: [{ hostId: userId }, { guestId: userId }],
          },
        },
        include: {
          session: true,
          uploader: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      })

      if (!file) {
        return res.status(404).json({ error: "File not found" })
      }

      // Check if file exists on disk
      try {
        await fs.access(file.path)
      } catch (error) {
        return res.status(404).json({ error: "File not found on disk" })
      }

      // Set appropriate headers
      res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`)
      res.setHeader("Content-Type", file.mimeType)
      res.setHeader("Content-Length", file.size)

      // Send file
      res.sendFile(path.resolve(file.path))
    } catch (error) {
      console.error("Download file error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get session files
  static async getSessionFiles(req, res) {
    try {
      const userId = req.user.userId
      const { sessionId } = req.params
      const { page = 1, limit = 20 } = req.query

      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
      const take = Number.parseInt(limit)

      // Verify user access to session
      const session = await req.prisma.session.findFirst({
        where: {
          id: sessionId,
          OR: [{ hostId: userId }, { guestId: userId }],
        },
      })

      if (!session) {
        return res.status(404).json({ error: "Session not found" })
      }

      const [files, total] = await Promise.all([
        req.prisma.file.findMany({
          where: { sessionId },
          include: {
            uploader: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: { uploadedAt: "desc" },
          skip,
          take,
        }),
        req.prisma.file.count({ where: { sessionId } }),
      ])

      res.json({
        files,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / Number.parseInt(limit)),
        },
      })
    } catch (error) {
      console.error("Get session files error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Delete file
  static async deleteFile(req, res) {
    try {
      const userId = req.user.userId
      const { fileId } = req.params

      // Find file and verify ownership or host access
      const file = await req.prisma.file.findFirst({
        where: {
          id: fileId,
          OR: [
            { uploaderId: userId }, // File uploader
            {
              session: {
                hostId: userId, // Session host
              },
            },
          ],
        },
        include: {
          session: true,
        },
      })

      if (!file) {
        return res.status(404).json({
          error: "File not found or you are not authorized to delete it",
        })
      }

      // Delete file from disk
      try {
        await fs.unlink(file.path)
      } catch (error) {
        console.warn("Could not delete file from disk:", error.message)
      }

      // Delete file record from database
      await req.prisma.file.delete({
        where: { id: fileId },
      })

      res.json({ message: "File deleted successfully" })
    } catch (error) {
      console.error("Delete file error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
}

module.exports = FileController
