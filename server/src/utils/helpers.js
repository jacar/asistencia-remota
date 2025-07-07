const crypto = require("crypto")

class Helpers {
  // Generate random session code
  static generateSessionCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Generate secure random string
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString("hex")
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Sanitize filename
  static sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9.-]/gi, "_").toLowerCase()
  }

  // Check if file type is allowed
  static isAllowedFileType(filename) {
    const dangerousExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".com", ".msi"]
    const extension = filename.toLowerCase().substring(filename.lastIndexOf("."))
    return !dangerousExtensions.includes(extension)
  }

  // Generate pagination metadata
  static getPaginationMeta(page, limit, total) {
    const totalPages = Math.ceil(total / limit)
    return {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }
}

module.exports = Helpers
