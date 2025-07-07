"use client"

import { useEffect, useRef, useState } from "react"
import { useAuthStore } from "../store/authStore"
import { socketService } from "../services/socket"

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (isAuthenticated && token) {
      connectSocket()
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, token])

  const connectSocket = async () => {
    try {
      const socketInstance = await socketService.connect(token)
      setSocket(socketInstance)
      setConnectionError(null)
      reconnectAttemptsRef.current = 0

      // Socket event listeners
      socketInstance.on("connect", () => {
        console.log("Socket connected")
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0
      })

      socketInstance.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason)
        setIsConnected(false)

        // Auto-reconnect for certain disconnect reasons
        if (reason === "io server disconnect") {
          // Server initiated disconnect, don't reconnect
          return
        }

        // Attempt to reconnect
        attemptReconnect()
      })

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
        setConnectionError(error.message)
        setIsConnected(false)
        attemptReconnect()
      })

      socketInstance.on("error", (error) => {
        console.error("Socket error:", error)
        setConnectionError(error.message)
      })
    } catch (error) {
      console.error("Failed to connect socket:", error)
      setConnectionError(error.message)
      attemptReconnect()
    }
  }

  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log("Max reconnection attempts reached")
      setConnectionError("Connection failed after multiple attempts")
      return
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000) // Exponential backoff, max 30s

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`)
      reconnectAttemptsRef.current++
      connectSocket()
    }, delay)
  }

  const disconnectSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socket) {
      socketService.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }

  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    } else {
      console.warn("Socket not connected, cannot emit event:", event)
    }
  }

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback)
    }
  }

  return {
    socket,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    reconnect: connectSocket,
  }
}
