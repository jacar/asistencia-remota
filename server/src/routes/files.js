const express = require("express")
const FileController = require("../controllers/fileController")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

router.post("/upload", FileController.getUploadMiddleware(), FileController.uploadFile)
router.get("/download/:fileId", FileController.downloadFile)
router.get("/session/:sessionId", FileController.getSessionFiles)
router.delete("/:fileId", FileController.deleteFile)

module.exports = router
