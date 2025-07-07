const { body, validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    })
  }
  next()
}

const validateRegistration = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("username")
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username must be 3-30 characters and contain only letters, numbers, and underscores"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
]

const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

const validateSessionCreation = [
  body("allowControl").optional().isBoolean().withMessage("allowControl must be a boolean"),
  body("allowFileTransfer").optional().isBoolean().withMessage("allowFileTransfer must be a boolean"),
  body("allowChat").optional().isBoolean().withMessage("allowChat must be a boolean"),
  handleValidationErrors,
]

const validateJoinSession = [
  body("sessionCode")
    .isLength({ min: 6, max: 6 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage("Session code must be 6 characters long and contain only uppercase letters and numbers"),
  handleValidationErrors,
]

module.exports = {
  validateRegistration,
  validateLogin,
  validateSessionCreation,
  validateJoinSession,
  handleValidationErrors,
}
