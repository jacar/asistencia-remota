const { v4: uuidv4 } = require("uuid")

class SessionController {
  // Create new session
  static async createSession(req, res) {
    try {
      const userId = req.user.userId
      const { allowControl = true, allowFileTransfer = true, allowChat = true } = req.body

      // Generate unique session code
      const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Create session
      const session = await req.prisma.session.create({
        data: {
          sessionCode,
          hostId: userId,
          allowControl,
          allowFileTransfer,
          allowChat,
        },
        include: {
          host: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      })

      res.status(201).json({
        message: "Session created successfully",
        session,
      })
    } catch (error) {
      console.error("Create session error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Join session by code
  static async joinSession(req, res) {
    try {
      const userId = req.user.userId
      const { sessionCode } = req.body

      if (!sessionCode) {
        return res.status(400).json({ error: "Session code is required" })
      }

      // Find active session
      const session = await req.prisma.session.findFirst({
        where: {
          sessionCode: sessionCode.toUpperCase(),
          isActive: true,
        },
        include: {
          host: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      })

      if (!session) {
        return res.status(404).json({ error: "Session not found or inactive" })
      }

      // Check if user is trying to join their own session
      if (session.hostId === userId) {
        return res.status(400).json({ error: "Cannot join your own session" })
      }

      // Check if session already has a guest
      if (session.guestId) {
        return res.status(409).json({ error: "Session already has a guest" })
      }

      // Update session with guest
      const updatedSession = await req.prisma.session.update({
        where: { id: session.id },
        data: { guestId: userId },
        include: {
          host: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          guest: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      })

      res.json({
        message: "Joined session successfully",
        session: updatedSession,
      })
    } catch (error) {
      console.error("Join session error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get user's sessions
  static async getUserSessions(req, res) {
    try {
      const userId = req.user.userId
      const { page = 1, limit = 10, active = null } = req.query

      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
      const take = Number.parseInt(limit)

      const whereClause = {
        OR: [{ hostId: userId }, { guestId: userId }],
      }

      if (active !== null) {
        whereClause.isActive = active === "true"
      }

      const [sessions, total] = await Promise.all([
        req.prisma.session.findMany({
          where: whereClause,
          include: {
            host: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            guest: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            _count: {
              select: {
                messages: true,
                files: true,
              },
            },
          },
          orderBy: { startedAt: "desc" },
          skip,
          take,
        }),
        req.prisma.session.count({ where: whereClause }),
      ])

      res.json({
        sessions,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / Number.parseInt(limit)),
        },
      })
    } catch (error) {
      console.error("Get user sessions error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get session details
  static async getSession(req, res) {
    try {
      const userId = req.user.userId
      const { sessionId } = req.params

      const session = await req.prisma.session.findFirst({
        where: {
          id: sessionId,
          OR: [{ hostId: userId }, { guestId: userId }],
        },
        include: {
          host: {
            select: {
              id: true,
              username: true,
              email: true,
              isOnline: true,
            },
          },
          guest: {
            select: {
              id: true,
              username: true,
              email: true,
              isOnline: true,
            },
          },
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
            orderBy: { timestamp: "asc" },
            take: 50,
          },
          files: {
            include: {
              uploader: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
            orderBy: { uploadedAt: "desc" },
            take: 20,
          },
        },
      })

      if (!session) {
        return res.status(404).json({ error: "Session not found" })
      }

      res.json({ session })
    } catch (error) {
      console.error("Get session error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // End session
  static async endSession(req, res) {
    try {
      const userId = req.user.userId
      const { sessionId } = req.params

      const session = await req.prisma.session.findFirst({
        where: {
          id: sessionId,
          hostId: userId, // Only host can end session
          isActive: true,
        },
      })

      if (!session) {
        return res.status(404).json({
          error: "Session not found or you are not authorized to end it",
        })
      }

      // Update session
      const updatedSession = await req.prisma.session.update({
        where: { id: sessionId },
        data: {
          isActive: false,
          endedAt: new Date(),
        },
      })

      res.json({
        message: "Session ended successfully",
        session: updatedSession,
      })
    } catch (error) {
      console.error("End session error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Update session settings
  static async updateSessionSettings(req, res) {
    try {
      const userId = req.user.userId
      const { sessionId } = req.params
      const { allowControl, allowFileTransfer, allowChat } = req.body

      const session = await req.prisma.session.findFirst({
        where: {
          id: sessionId,
          hostId: userId, // Only host can update settings
          isActive: true,
        },
      })

      if (!session) {
        return res.status(404).json({
          error: "Session not found or you are not authorized to update it",
        })
      }

      const updatedSession = await req.prisma.session.update({
        where: { id: sessionId },
        data: {
          ...(allowControl !== undefined && { allowControl }),
          ...(allowFileTransfer !== undefined && { allowFileTransfer }),
          ...(allowChat !== undefined && { allowChat }),
        },
      })

      res.json({
        message: "Session settings updated successfully",
        session: updatedSession,
      })
    } catch (error) {
      console.error("Update session settings error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
}

module.exports = SessionController
