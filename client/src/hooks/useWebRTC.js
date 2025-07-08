"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { webrtcService } from "../services/webrtc"
import { useAuthStore } from "../store/authStore"
import toast from "react-hot-toast"

export const useWebRTC = (sessionId, socket) => {
  const { user } = useAuthStore()
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [connectionState, setConnectionState] = useState("new")
  const [dataChannel, setDataChannel] = useState(null)

  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const dataChannelRef = useRef(null)

  // Initialize WebRTC connection
  const initializeConnection = useCallback(async () => {
    if (!socket || !sessionId) {
      console.log("❌ WebRTC: Socket o sessionId no disponibles", { socket: !!socket, sessionId })
      return
    }

    try {
      console.log("🚀 Inicializando conexión WebRTC...")
      const pc = await webrtcService.createPeerConnection()
      peerConnectionRef.current = pc

      // Set up event listeners
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState
        console.log("🔗 WebRTC Connection State:", state)
        setConnectionState(state)
        setIsConnected(state === "connected")

        if (state === "failed") {
          console.error("❌ WebRTC connection failed")
          toast.error("WebRTC connection failed")
          // Attempt to restart ICE
          pc.restartIce()
        } else if (state === "connected") {
          console.log("✅ WebRTC connected successfully")
          toast.success("WebRTC connected!")
        }
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log("🧊 Enviando ICE candidate")
          socket.emit("webrtc-ice-candidate", {
            sessionId,
            candidate: event.candidate,
            targetUserId: "all",
          })
        }
      }

      pc.ontrack = (event) => {
        console.log("📹 Received remote stream")
        const [stream] = event.streams
        setRemoteStream(stream)
        remoteStreamRef.current = stream
      }

      pc.ondatachannel = (event) => {
        console.log("📡 Data channel received")
        const channel = event.channel
        setupDataChannel(channel)
      }

      // Set up socket listeners for WebRTC signaling
      setupSocketListeners()

      console.log("✅ WebRTC connection initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize WebRTC:", error)
      toast.error("Failed to initialize connection")
    }
  }, [socket, sessionId])

  const setupSocketListeners = useCallback(() => {
    if (!socket) {
      console.log("❌ Socket no disponible para WebRTC listeners")
      return
    }

    console.log("🔌 Configurando WebRTC socket listeners...")

    socket.on("webrtc-offer", async (data) => {
      console.log("📞 WebRTC Offer recibido:", data)
      try {
        await webrtcService.handleOffer(peerConnectionRef.current, data.offer)
        const answer = await webrtcService.createAnswer(peerConnectionRef.current)

        console.log("📤 Enviando WebRTC Answer")
        socket.emit("webrtc-answer", {
          sessionId,
          answer,
          targetUserId: data.fromUserId,
        })
      } catch (error) {
        console.error("❌ Failed to handle offer:", error)
      }
    })

    socket.on("webrtc-answer", async (data) => {
      console.log("📥 WebRTC Answer recibido:", data)
      try {
        await webrtcService.handleAnswer(peerConnectionRef.current, data.answer)
        console.log("✅ WebRTC Answer procesado correctamente")
      } catch (error) {
        console.error("❌ Failed to handle answer:", error)
      }
    })

    socket.on("webrtc-ice-candidate", async (data) => {
      console.log("🧊 WebRTC ICE candidate recibido:", data)
      try {
        await webrtcService.addIceCandidate(peerConnectionRef.current, data.candidate)
        console.log("✅ ICE candidate agregado correctamente")
      } catch (error) {
        console.error("❌ Failed to add ICE candidate:", error)
      }
    })

    console.log("✅ WebRTC socket listeners configurados")

    return () => {
      console.log("🧹 Limpiando WebRTC socket listeners")
      socket.off("webrtc-offer")
      socket.off("webrtc-answer")
      socket.off("webrtc-ice-candidate")
    }
  }, [socket, sessionId])

  const setupDataChannel = (channel) => {
    channel.onopen = () => {
      console.log("Data channel opened")
      setDataChannel(channel)
      dataChannelRef.current = channel
    }

    channel.onclose = () => {
      console.log("Data channel closed")
      setDataChannel(null)
      dataChannelRef.current = null
    }

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleDataChannelMessage(data)
      } catch (error) {
        console.error("Failed to parse data channel message:", error)
      }
    }

    channel.onerror = (error) => {
      console.error("Data channel error:", error)
    }
  }

  const handleDataChannelMessage = (data) => {
    switch (data.type) {
      case "file-chunk":
        // Handle file transfer chunk
        handleFileChunk(data)
        break
      case "remote-input":
        // Handle remote control input
        handleRemoteInput(data)
        break
      default:
        console.log("Unknown data channel message:", data)
    }
  }

  const handleFileChunk = (data) => {
    // File transfer logic would go here
    console.log("Received file chunk:", data)
  }

  const handleRemoteInput = (data) => {
    // Remote control logic would go here
    console.log("Received remote input:", data)
  }

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await webrtcService.getScreenStream()
      setLocalStream(stream)
      localStreamRef.current = stream

      // Add tracks to peer connection
      if (peerConnectionRef.current) {
        stream.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, stream)
        })

        // Create and send offer
        const offer = await webrtcService.createOffer(peerConnectionRef.current)
        socket?.emit("webrtc-offer", {
          sessionId,
          offer,
          targetUserId: "all",
        })
      }

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      toast.success("Screen sharing started")
    } catch (error) {
      console.error("Failed to start screen share:", error)
      toast.error("Failed to start screen sharing")
    }
  }, [sessionId, socket])

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      setLocalStream(null)
      localStreamRef.current = null
    }

    // Remove tracks from peer connection
    if (peerConnectionRef.current) {
      const senders = peerConnectionRef.current.getSenders()
      senders.forEach((sender) => {
        if (sender.track) {
          peerConnectionRef.current.removeTrack(sender)
        }
      })
    }

    toast.info("Screen sharing stopped")
  }, [])

  // Request remote control
  const requestRemoteControl = useCallback(() => {
    if (socket) {
      socket.emit("remote-control-request", { sessionId })
    }
  }, [socket, sessionId])

  // Send remote input
  const sendRemoteInput = useCallback(
    (inputData) => {
      if (dataChannelRef.current && dataChannelRef.current.readyState === "open") {
        dataChannelRef.current.send(
          JSON.stringify({
            type: "remote-input",
            data: inputData,
          }),
        )
      } else if (socket) {
        // Fallback to socket if data channel not available
        socket.emit("remote-input", {
          sessionId,
          inputData,
          targetUserId: "all",
        })
      }
    },
    [socket, sessionId],
  )

  // Send file via data channel
  const sendFile = useCallback(async (file) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      throw new Error("Data channel not available")
    }

    const chunkSize = 16384 // 16KB chunks
    const fileReader = new FileReader()
    let offset = 0

    return new Promise((resolve, reject) => {
      fileReader.onload = (event) => {
        const chunk = event.target.result
        dataChannelRef.current.send(
          JSON.stringify({
            type: "file-chunk",
            fileName: file.name,
            fileSize: file.size,
            offset,
            chunk: Array.from(new Uint8Array(chunk)),
            isLast: offset + chunkSize >= file.size,
          }),
        )

        offset += chunkSize
        if (offset < file.size) {
          readNextChunk()
        } else {
          resolve()
        }
      }

      fileReader.onerror = reject

      const readNextChunk = () => {
        const slice = file.slice(offset, offset + chunkSize)
        fileReader.readAsArrayBuffer(slice)
      }

      readNextChunk()
    })
  }, [])

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop all streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }

    // Reset state
    setLocalStream(null)
    setRemoteStream(null)
    setIsConnected(false)
    setConnectionState("new")
    setDataChannel(null)

    // Clear refs
    localStreamRef.current = null
    remoteStreamRef.current = null
    dataChannelRef.current = null
    peerConnectionRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    localStream,
    remoteStream,
    isConnected,
    isHost,
    connectionState,
    dataChannel,
    initializeConnection,
    startScreenShare,
    stopScreenShare,
    requestRemoteControl,
    sendRemoteInput,
    sendFile,
    cleanup,
  }
}
