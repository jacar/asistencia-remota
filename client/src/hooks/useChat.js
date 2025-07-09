import { useEffect, useState, useCallback } from "react"
import { socketService } from "../services/socket"

export function useChat(roomId, user) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!roomId) return
    // Unirse a la sala
    socketService.emit("join-room", roomId)

    // Escuchar mensajes
    socketService.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socketService.off("chat-message")
    }
  }, [roomId])

  // Enviar mensaje
  const sendMessage = useCallback(
    (text) => {
      if (!roomId || !user) return
      socketService.emit("chat-message", {
        roomId,
        message: text,
        sender: user.username || user.id || "anon",
      })
    },
    [roomId, user]
  )

  return { messages, sendMessage }
} 