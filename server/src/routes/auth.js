const express = require("express")
const AuthController = require("../controllers/authController")
const { authenticateToken } = require("../middleware/auth")
const { validateRegistration, validateLogin } = require("../middleware/validation")

const router = express.Router()

// Public routes
router.post("/register", validateRegistration, AuthController.register)
router.post("/login", validateLogin, AuthController.login)

// Protected routes
router.post("/logout", authenticateToken, AuthController.logout)
router.get("/profile", authenticateToken, AuthController.getProfile)
router.put("/profile", authenticateToken, AuthController.updateProfile)

module.exports = router
