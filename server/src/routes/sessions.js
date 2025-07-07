const express = require("express")
const SessionController = require("../controllers/sessionController")
const { authenticateToken } = require("../middleware/auth")
const { validateSessionCreation, validateJoinSession } = require("../middleware/validation")

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

router.post("/", validateSessionCreation, SessionController.createSession)
router.post("/join", validateJoinSession, SessionController.joinSession)
router.get("/", SessionController.getUserSessions)
router.get("/:sessionId", SessionController.getSession)
router.put("/:sessionId/end", SessionController.endSession)
router.put("/:sessionId/settings", SessionController.updateSessionSettings)

module.exports = router
