import axios from "axios"
import toast from "react-hot-toast"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
          window.location.href = "/login"
          break

        case 403:
          toast.error("Access forbidden")
          break

        case 404:
          toast.error("Resource not found")
          break

        case 429:
          toast.error("Too many requests. Please try again later.")
          break

        case 500:
          toast.error("Server error. Please try again later.")
          break

        default:
          if (response.data?.error) {
            toast.error(response.data.error)
          } else {
            toast.error("An unexpected error occurred")
          }
      }
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timeout. Please check your connection.")
    } else if (error.message === "Network Error") {
      toast.error("Network error. Please check your connection.")
    } else {
      toast.error("An unexpected error occurred")
    }

    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (email, username, password) => api.post("/auth/register", { email, username, password }),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
}

// Sessions API
export const sessionsAPI = {
  create: (settings) => api.post("/sessions", settings),
  join: (sessionCode) => api.post("/sessions/join", { sessionCode }),
  getUserSessions: (params) => api.get("/sessions", { params }),
  getSession: (sessionId) => api.get(`/sessions/${sessionId}`),
  endSession: (sessionId) => api.put(`/sessions/${sessionId}/end`),
  updateSettings: (sessionId, settings) => api.put(`/sessions/${sessionId}/settings`, settings),
}

// Files API
export const filesAPI = {
  upload: (formData, onUploadProgress) =>
    api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }),
  download: (fileId) => api.get(`/files/download/${fileId}`, { responseType: "blob" }),
  getSessionFiles: (sessionId, params) => api.get(`/files/session/${sessionId}`, { params }),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
}

// Health check
export const healthAPI = {
  check: () => api.get("/health"),
}

export { api }
export default api
