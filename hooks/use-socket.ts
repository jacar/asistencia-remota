import { useEffect, useRef, useCallback, useState } from "react"
import { io, Socket } from "socket.io-client"

interface SocketMessage {
  roomId: string
  message: string
  sender?: string
  timestamp: Date
}

interface ControlRequest {
  roomId: string
  message: string
  senderId: string
  timestamp: Date
}

interface ControlResponse {
  roomId: string
  accepted: boolean
  message: string
  senderId: string
  timestamp: Date
}

export const useSocket = (roomId?: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(async () => {
    if (!roomId || socketRef.current?.connected) {
      return
    }

    try {
      setIsConnecting(true)
      console.log("🔌 Connecting to Socket.IO server...")

      // Verificar si el servidor está disponible
      const statusResponse = await fetch("/api/socket/status")
      if (!statusResponse.ok) {
        console.log("⚠️ Socket server not available, using polling fallback")
        return
      }

      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      })

      socket.on("connect", () => {
        console.log("✅ Connected to Socket.IO server")
        setIsConnected(true)
        setIsConnecting(false)

        // Unirse a la sala
        if (roomId) {
          socket.emit("join-room", roomId)
          console.log(`👥 Joined room: ${roomId}`)
        }
      })

      socket.on("disconnect", () => {
        console.log("🔌 Disconnected from Socket.IO server")
        setIsConnected(false)
      })

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error)
        setIsConnecting(false)
      })

      socket.on("user-joined", (data) => {
        console.log("👥 User joined room:", data)
      })

      socketRef.current = socket
    } catch (error) {
      console.error("Error connecting to Socket.IO:", error)
      setIsConnecting(false)
    }
  }, [roomId])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
      console.log("🔌 Disconnected from Socket.IO")
    }
  }, [])

  const sendControlRequest = useCallback((message: string) => {
    if (socketRef.current?.connected && roomId) {
      socketRef.current.emit("control-request", {
        roomId,
        message
      })
      console.log("🎮 Control request sent via WebSocket")
    }
  }, [roomId])

  const sendControlResponse = useCallback((accepted: boolean, message: string) => {
    if (socketRef.current?.connected && roomId) {
      socketRef.current.emit("control-response", {
        roomId,
        accepted,
        message
      })
      console.log("✅ Control response sent via WebSocket")
    }
  }, [roomId])

  const sendChatMessage = useCallback((message: string, sender: string) => {
    if (socketRef.current?.connected && roomId) {
      socketRef.current.emit("chat-message", {
        roomId,
        message,
        sender
      })
      console.log("💬 Chat message sent via WebSocket")
    }
  }, [roomId])

  const onControlRequest = useCallback((callback: (data: ControlRequest) => void) => {
    if (socketRef.current) {
      socketRef.current.on("control-request", callback)
    }
  }, [])

  const onControlResponse = useCallback((callback: (data: ControlResponse) => void) => {
    if (socketRef.current) {
      socketRef.current.on("control-response", callback)
    }
  }, [])

  const onChatMessage = useCallback((callback: (data: SocketMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on("chat-message", callback)
    }
  }, [])

  useEffect(() => {
    if (roomId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [roomId, connect, disconnect])

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendControlRequest,
    sendControlResponse,
    sendChatMessage,
    onControlRequest,
    onControlResponse,
    onChatMessage,
  }
} 