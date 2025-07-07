import { ERROR_MESSAGES, FILE_CONFIG } from "./constants"

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Format duration
export const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

// Format date
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }

  return new Date(date).toLocaleDateString(undefined, { ...defaultOptions, ...options })
}

// Generate session code
export const generateSessionCode = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password
export const isValidPassword = (password) => {
  return password.length >= 6
}

// Validate username
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  return usernameRegex.test(username)
}

// Validate file
export const validateFile = (file) => {
  const errors = []

  // Check file size
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    errors.push(ERROR_MESSAGES.FILE_TOO_LARGE)
  }

  // Check file type
  const isAllowedType = FILE_CONFIG.ALLOWED_TYPES.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type
  })

  if (!isAllowedType) {
    errors.push(ERROR_MESSAGES.UNSUPPORTED_FILE)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map((item) => deepClone(item))
  if (typeof obj === "object") {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// Get browser info
export const getBrowserInfo = () => {
  const ua = navigator.userAgent
  let browser = "Unknown"
  let version = "Unknown"

  if (ua.includes("Chrome")) {
    browser = "Chrome"
    version = ua.match(/Chrome\/(\d+)/)?.[1] || "Unknown"
  } else if (ua.includes("Firefox")) {
    browser = "Firefox"
    version = ua.match(/Firefox\/(\d+)/)?.[1] || "Unknown"
  } else if (ua.includes("Safari")) {
    browser = "Safari"
    version = ua.match(/Version\/(\d+)/)?.[1] || "Unknown"
  } else if (ua.includes("Edge")) {
    browser = "Edge"
    version = ua.match(/Edge\/(\d+)/)?.[1] || "Unknown"
  }

  return { browser, version }
}

// Check WebRTC support
export const checkWebRTCSupport = () => {
  const support = {
    peerConnection: !!window.RTCPeerConnection,
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    getDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
    dataChannel: true, // Assume supported if RTCPeerConnection exists
  }

  support.isSupported = Object.values(support).every(Boolean)

  return support
}

// Generate UUID
export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand("copy")
      document.body.removeChild(textArea)
      return true
    } catch (fallbackError) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

// Download file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// Get device info
export const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  }
}

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return defaultValue
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Error writing to localStorage:", error)
      return false
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error("Error removing from localStorage:", error)
      return false
    }
  },

  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error("Error clearing localStorage:", error)
      return false
    }
  },
}

// URL helpers
export const url = {
  getParams: () => {
    const params = new URLSearchParams(window.location.search)
    const result = {}
    for (const [key, value] of params) {
      result[key] = value
    }
    return result
  },

  setParam: (key, value) => {
    const url = new URL(window.location)
    url.searchParams.set(key, value)
    window.history.pushState({}, "", url)
  },

  removeParam: (key) => {
    const url = new URL(window.location)
    url.searchParams.delete(key)
    window.history.pushState({}, "", url)
  },
}

export default {
  formatFileSize,
  formatDuration,
  formatDate,
  generateSessionCode,
  isValidEmail,
  isValidPassword,
  isValidUsername,
  validateFile,
  debounce,
  throttle,
  deepClone,
  getBrowserInfo,
  checkWebRTCSupport,
  generateUUID,
  copyToClipboard,
  downloadFile,
  getDeviceInfo,
  storage,
  url,
}
