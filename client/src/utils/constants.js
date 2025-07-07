// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",
  TIMEOUT: 30000,
}

// WebRTC Configuration
export const WEBRTC_CONFIG = {
  ICE_SERVERS: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
  ICE_CANDIDATE_POOL_SIZE: 10,
  DATA_CHANNEL_CONFIG: {
    ordered: true,
    maxRetransmits: 3,
  },
}

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: [
    "image/*",
    "video/*",
    "audio/*",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/*",
    "application/zip",
    "application/x-rar-compressed",
  ],
  CHUNK_SIZE: 16384, // 16KB for WebRTC data channel
}

// Session Configuration
export const SESSION_CONFIG = {
  CODE_LENGTH: 6,
  MAX_PARTICIPANTS: 2,
  TIMEOUT: 3600000, // 1 hour
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000,
}

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 4000,
  LOADING_DELAY: 300,
  DEBOUNCE_DELAY: 500,
  PAGINATION_SIZE: 10,
}

// Remote Control Configuration
export const REMOTE_CONFIG = {
  MOUSE_SENSITIVITY: 1.0,
  KEYBOARD_REPEAT_DELAY: 500,
  SCREEN_QUALITY: "high", // low, medium, high
  FRAME_RATE: 30,
}

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_MESSAGES_DISPLAY: 100,
  TYPING_TIMEOUT: 3000,
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  AUTH_ERROR: "Authentication failed. Please login again.",
  SESSION_NOT_FOUND: "Session not found or has expired.",
  PERMISSION_DENIED: "Permission denied. Please check your browser settings.",
  FILE_TOO_LARGE: "File is too large. Maximum size is 50MB.",
  UNSUPPORTED_FILE: "File type not supported.",
  CONNECTION_FAILED: "Connection failed. Please try again.",
  WEBRTC_NOT_SUPPORTED: "WebRTC is not supported in your browser.",
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  REGISTER_SUCCESS: "Registration successful!",
  SESSION_CREATED: "Session created successfully!",
  SESSION_JOINED: "Joined session successfully!",
  FILE_UPLOADED: "File uploaded successfully!",
  FILE_DOWNLOADED: "File downloaded successfully!",
  SETTINGS_UPDATED: "Settings updated successfully!",
}

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  AUTH_USER: "auth_user",
  THEME: "theme",
  LANGUAGE: "language",
  SETTINGS: "user_settings",
}

// Event Names
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",

  // Session
  JOIN_SESSION: "join-session",
  LEAVE_SESSION: "leave-session",
  SESSION_JOINED: "session-joined",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",

  // WebRTC
  WEBRTC_OFFER: "webrtc-offer",
  WEBRTC_ANSWER: "webrtc-answer",
  WEBRTC_ICE_CANDIDATE: "webrtc-ice-candidate",

  // Screen Share
  START_SCREEN_SHARE: "start-screen-share",
  STOP_SCREEN_SHARE: "stop-screen-share",
  SCREEN_SHARE_STARTED: "screen-share-started",
  SCREEN_SHARE_STOPPED: "screen-share-stopped",

  // Remote Control
  REMOTE_CONTROL_REQUEST: "remote-control-request",
  REMOTE_CONTROL_RESPONSE: "remote-control-response",
  REMOTE_INPUT: "remote-input",

  // Chat
  CHAT_MESSAGE: "chat-message",
  USER_TYPING: "user-typing",

  // File Transfer
  FILE_TRANSFER_OFFER: "file-transfer-offer",
  FILE_TRANSFER_RESPONSE: "file-transfer-response",
}

// WebRTC Data Channel Labels
export const DATA_CHANNEL_LABELS = {
  FILE_TRANSFER: "file-transfer",
  REMOTE_CONTROL: "remote-control",
  CHAT: "chat",
}

// Browser Support
export const BROWSER_SUPPORT = {
  MIN_CHROME: 60,
  MIN_FIREFOX: 60,
  MIN_SAFARI: 12,
  MIN_EDGE: 79,
}

export default {
  API_CONFIG,
  WEBRTC_CONFIG,
  FILE_CONFIG,
  SESSION_CONFIG,
  UI_CONFIG,
  REMOTE_CONFIG,
  CHAT_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  SOCKET_EVENTS,
  DATA_CHANNEL_LABELS,
  BROWSER_SUPPORT,
}
