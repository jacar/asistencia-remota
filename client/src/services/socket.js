// Forzar redeploy en Vercel - Conexión Socket.IO mejorada
import { io } from "socket.io-client"

// Forzar URL del backend en Render directamente
const SOCKET_URL = "https://portafolionext-js.onrender.com"

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect(token) {
    return new Promise((resolve, reject) => {
      try {
        console.log("🔌 Conectando Socket.IO a:", SOCKET_URL)
        
        this.socket = io(SOCKET_URL, {
          auth: {
            token: token,
          },
          transports: ["websocket", "polling"],
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        })

        this.socket.on("connect", () => {
          console.log("✅ Socket.io connected successfully")
          this.isConnected = true
          resolve(this.socket)
        })

        this.socket.on("connect_error", (error) => {
          console.error("❌ Socket.io connection error:", error)
          this.isConnected = false
          reject(error)
        })

        this.socket.on("disconnect", (reason) => {
          console.log("🔌 Socket.io disconnected:", reason)
          this.isConnected = false
        })

        this.socket.on("error", (error) => {
          console.error("❌ Socket.io error:", error)
        })

        // Set connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error("Connection timeout"))
          }
        }, 10000)
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.warn("Socket not connected, cannot emit:", event)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  getSocket() {
    return this.socket
  }

  isSocketConnected() {
    return this.isConnected
  }

  onPermissionDenied(callback) {
    this.on("permission-denied", callback)
  }

  onPermissionGranted(callback) {
    this.on("permission-granted", callback)
  }
}

export const socketService = new SocketService()
export default socketService
