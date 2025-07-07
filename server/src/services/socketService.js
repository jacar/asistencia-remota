const jwt = require("jsonwebtoken")

class SocketService {
  constructor() {
    this.io = null
    this.prisma = null
    this.connectedUsers = new Map() // userId -> socketId
    this.userSockets = new Map() // socketId -> userId
    this.sessionRooms = new Map() // sessionId -> Set of socketIds
  }

  initialize(io, prisma) {
    this.io = io
    this.prisma = prisma
    this.setupSocketHandlers()
  }

  setupSocketHandlers() {
    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error("Authentication error"))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await this.prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, username: true, email: true },
        })

        if (!user) {
          return next(new Error("User not found"))
        }

        socket.userId = user.id
        socket.user = user
        next()
      } catch (error) {
        next(new Error("Authentication error"))
      }
    })

    this.io.on("connection", (socket) => {
      console.log(`User ${socket.user.username} connected: ${socket.id}`)

      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id)
      this.userSockets.set(socket.id, socket.userId)

      // Update user online status
      this.updateUserOnlineStatus(socket.userId, true)

      // Socket event handlers
      this.handleJoinSession(socket)
      this.handleLeaveSession(socket)
      this.handleChatMessage(socket)
      this.handleWebRTCSignaling(socket)
      this.handleScreenShare(socket)
      this.handleRemoteControl(socket)
      this.handleFileTransferSignaling(socket)
      this.handleDisconnection(socket)
    })
  }

  handleJoinSession(socket) {
    socket.on("join-session", async (data) => {
      try {
        const { sessionId } = data

        // Verify user has access to session
        const session = await this.prisma.session.findFirst({
          where: {
            id: sessionId,
            isActive: true,
            OR: [{ hostId: socket.userId }, { guestId: socket.userId }],
          },
          include: {
            host: { select: { id: true, username: true } },
            guest: { select: { id: true, username: true } },
          },
        })

        if (!session) {
          socket.emit("error", { message: "Session not found or access denied" })
          return
        }

        // Join session room
        socket.join(sessionId)

        // Add to session rooms tracking
        if (!this.sessionRooms.has(sessionId)) {
          this.sessionRooms.set(sessionId, new Set())
        }
        this.sessionRooms.get(sessionId).add(socket.id)

        // Notify others in the session
        socket.to(sessionId).emit("user-joined", {
          user: socket.user,
          sessionId,
        })

        // Send session info to the joining user
        socket.emit("session-joined", {
          session,
          connectedUsers: this.getSessionUsers(sessionId),
        })

        console.log(`User ${socket.user.username} joined session ${sessionId}`)
      } catch (error) {
        console.error("Join session error:", error)
        socket.emit("error", { message: "Failed to join session" })
      }
    })
  }

  handleLeaveSession(socket) {
    socket.on("leave-session", (data) => {
      const { sessionId } = data
      this.leaveSession(socket, sessionId)
    })
  }

  handleChatMessage(socket) {
    socket.on("chat-message", async (data) => {
      try {
        const { sessionId, message } = data

        // Verify user has access to session
        const session = await this.prisma.session.findFirst({
          where: {
            id: sessionId,
            isActive: true,
            allowChat: true,
            OR: [{ hostId: socket.userId }, { guestId: socket.userId }],
          },
        })

        if (!session) {
          socket.emit("error", { message: "Cannot send message to this session" })
          return
        }

        // Save message to database
        const savedMessage = await this.prisma.message.create({
          data: {
            content: message,
            senderId: socket.userId,
            sessionId: sessionId,
          },
          include: {
            sender: {
              select: { id: true, username: true },
            },
          },
        })

        // Broadcast message to session room
        this.io.to(sessionId).emit("chat-message", savedMessage)
      } catch (error) {
        console.error("Chat message error:", error)
        socket.emit("error", { message: "Failed to send message" })
      }
    })
  }

  handleWebRTCSignaling(socket) {
    // WebRTC offer
    socket.on("webrtc-offer", (data) => {
      const { sessionId, offer, targetUserId } = data
      const targetSocketId = this.connectedUsers.get(targetUserId)

      if (targetSocketId) {
        this.io.to(targetSocketId).emit("webrtc-offer", {
          offer,
          fromUserId: socket.userId,
          sessionId,
        })
      }
    })

    // WebRTC answer
    socket.on("webrtc-answer", (data) => {
      const { sessionId, answer, targetUserId } = data
      const targetSocketId = this.connectedUsers.get(targetUserId)

      if (targetSocketId) {
        this.io.to(targetSocketId).emit("webrtc-answer", {
          answer,
          fromUserId: socket.userId,
          sessionId,
        })
      }
    })

    // ICE candidates
    socket.on("webrtc-ice-candidate", (data) => {
      const { sessionId, candidate, targetUserId } = data
      const targetSocketId = this.connectedUsers.get(targetUserId)

      if (targetSocketId) {
        this.io.to(targetSocketId).emit("webrtc-ice-candidate", {
          candidate,
          fromUserId: socket.userId,
          sessionId,
        })
      }
    })
  }

  handleScreenShare(socket) {
    socket.on("start-screen-share", async (data) => {
      try {
        const { sessionId } = data

        // Verify user is host of the session
        const session = await this.prisma.session.findFirst({
          where: {
            id: sessionId,
            hostId: socket.userId,
            isActive: true,
          },
        })

        if (!session) {
          socket.emit("error", { message: "Only session host can share screen" })
          return
        }

        // Notify session participants
        socket.to(sessionId).emit("screen-share-started", {
          hostId: socket.userId,
          sessionId,
        })
      } catch (error) {
        console.error("Screen share error:", error)
        socket.emit("error", { message: "Failed to start screen share" })
      }
    })

    socket.on("stop-screen-share", (data) => {
      const { sessionId } = data
      socket.to(sessionId).emit("screen-share-stopped", {
        hostId: socket.userId,
        sessionId,
      })
    })
  }

  handleRemoteControl(socket) {
    socket.on("remote-control-request", async (data) => {
      try {
        const { sessionId } = data

        // Verify session allows control
        const session = await this.prisma.session.findFirst({
          where: {
            id: sessionId,
            guestId: socket.userId,
            allowControl: true,
            isActive: true,
          },
        })

        if (!session) {
          socket.emit("error", { message: "Remote control not allowed" })
          return
        }

        // Send request to host
        const hostSocketId = this.connectedUsers.get(session.hostId)
        if (hostSocketId) {
          this.io.to(hostSocketId).emit("remote-control-request", {
            fromUserId: socket.userId,
            sessionId,
          })
        }
      } catch (error) {
        console.error("Remote control request error:", error)
        socket.emit("error", { message: "Failed to request remote control" })
      }
    })

    socket.on("remote-control-response", (data) => {
      const { sessionId, accepted, targetUserId } = data
      const targetSocketId = this.connectedUsers.get(targetUserId)

      if (targetSocketId) {
        this.io.to(targetSocketId).emit("remote-control-response", {
          accepted,
          sessionId,
        })
      }
    })

    // Mouse and keyboard events
    socket.on("remote-input", (data) => {
      const { sessionId, inputData, targetUserId } = data
      const targetSocketId = this.connectedUsers.get(targetUserId)

      if (targetSocketId) {
        this.io.to(targetSocketId).emit("remote-input", {
          inputData,
          fromUserId: socket.userId,
          sessionId,
        })
      }
    })
  }

  handleFileTransferSignaling(socket) {
    socket.on("file-transfer-offer", async (data) => {
      try {
        const { sessionId, fileName, fileSize, targetUserId } = data

        // Verify session allows file transfer
        const session = await this.prisma.session.findFirst({
          where: {
            id: sessionId,
            allowFileTransfer: true,
            isActive: true,
            OR: [{ hostId: socket.userId }, { guestId: socket.userId }],
          },
        })

        if (!session) {
          socket.emit("error", { message: "File transfer not allowed" })
          return
        }

        const targetSocketId = this.connectedUsers.get(targetUserId)
        if (targetSocketId) {
          this.io.to(targetSocketId).emit("file-transfer-offer", {
            fileName,
            fileSize,
            fromUserId: socket.userId,
            sessionId,
          })
        }
      } catch (error) {
        console.error("File transfer offer error:", error)
        socket.emit("error", { message: "Failed to offer file transfer" })
      }
    })

    socket.on("file-transfer-response", (data) => {
      const { sessionId, accepted, targetUserId } = data
      const targetSocketId = this.connectedUsers.get(targetUserId)

      if (targetSocketId) {
        this.io.to(targetSocketId).emit("file-transfer-response", {
          accepted,
          sessionId,
        })
      }
    })
  }

  handleDisconnection(socket) {
    socket.on("disconnect", () => {
      console.log(`User ${socket.user.username} disconnected: ${socket.id}`)

      // Clean up user connections
      this.connectedUsers.delete(socket.userId)
      this.userSockets.delete(socket.id)

      // Remove from all session rooms
      for (const [sessionId, socketIds] of this.sessionRooms.entries()) {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id)

          // Notify others in the session
          socket.to(sessionId).emit("user-left", {
            user: socket.user,
            sessionId,
          })

          // Clean up empty session rooms
          if (socketIds.size === 0) {
            this.sessionRooms.delete(sessionId)
          }
        }
      }

      // Update user offline status
      this.updateUserOnlineStatus(socket.userId, false)
    })
  }

  leaveSession(socket, sessionId) {
    socket.leave(sessionId)

    // Remove from session room tracking
    if (this.sessionRooms.has(sessionId)) {
      this.sessionRooms.get(sessionId).delete(socket.id)

      // Notify others in the session
      socket.to(sessionId).emit("user-left", {
        user: socket.user,
        sessionId,
      })

      // Clean up empty session rooms
      if (this.sessionRooms.get(sessionId).size === 0) {
        this.sessionRooms.delete(sessionId)
      }
    }

    console.log(`User ${socket.user.username} left session ${sessionId}`)
  }

  getSessionUsers(sessionId) {
    const socketIds = this.sessionRooms.get(sessionId) || new Set()
    const users = []

    for (const socketId of socketIds) {
      const userId = this.userSockets.get(socketId)
      if (userId) {
        const socket = this.io.sockets.sockets.get(socketId)
        if (socket && socket.user) {
          users.push(socket.user)
        }
      }
    }

    return users
  }

  async updateUserOnlineStatus(userId, isOnline) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isOnline },
      })
    } catch (error) {
      console.error("Update user online status error:", error)
    }
  }
}

module.exports = new SocketService()
