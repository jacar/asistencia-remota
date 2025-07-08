import next from "next"
import { createServer } from "http"
import { Server } from "socket.io"

const app = next({ dev: process.env.NODE_ENV !== "production" })
const handler = app.getRequestHandler()

console.log("🚀 Iniciando FULLASISTENTE Server...")
console.log("👨‍💻 Desarrollado por: Armando Ovalle")
console.log("📱 WhatsApp: +57 305 289 1719")
console.log("💬 Mensaje: 'hola quiero asistencia'")

app.prepare().then(() => {
  const httpServer = createServer(handler)
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  // Store active rooms and connections
  const activeRooms = new Map()
  const userConnections = new Map()

  console.log("🔌 Socket.IO configurado correctamente")

  io.on("connection", (socket) => {
    console.log("✅ Usuario conectado:", socket.id)

    // Store user connection
    userConnections.set(socket.id, {
      id: socket.id,
      connectedAt: new Date(),
      userAgent: socket.handshake.headers["user-agent"],
    })

    // Send welcome message
    socket.emit("welcome", {
      message: "Bienvenido a FULLASISTENTE",
      developer: "Armando Ovalle",
      whatsapp: "+57 305 289 1719",
      serverId: socket.id,
    })

    // Create room (host)
    socket.on("create-room", (roomCode) => {
      try {
        socket.join(roomCode)
        activeRooms.set(roomCode, {
          hostId: socket.id,
          guestId: null,
          createdAt: new Date(),
          roomCode: roomCode,
          status: "waiting",
        })

        console.log(`🏠 Sala creada: ${roomCode} por ${socket.id}`)
        socket.emit("room-created", {
          roomCode,
          hostId: socket.id,
          message: "Sala creada exitosamente",
        })
      } catch (error) {
        console.error("Error creando sala:", error)
        socket.emit("room-error", { message: "Error al crear la sala" })
      }
    })

    // Join room (guest)
    socket.on("join-room", (roomCode) => {
      try {
        const room = activeRooms.get(roomCode)

        if (room && !room.guestId) {
          socket.join(roomCode)
          room.guestId = socket.id
          room.status = "connected"

          console.log(`👤 Usuario ${socket.id} se unió a la sala ${roomCode}`)

          // Notify both users
          socket.emit("room-joined", {
            roomCode,
            hostId: room.hostId,
            message: "Conectado exitosamente",
          })

          socket.to(room.hostId).emit("guest-joined", {
            guestId: socket.id,
            message: "Un técnico se ha conectado",
          })
        } else if (room && room.guestId) {
          socket.emit("room-error", { message: "La sala ya está ocupada" })
        } else {
          socket.emit("room-error", { message: "Código de sala no válido" })
        }
      } catch (error) {
        console.error("Error uniéndose a sala:", error)
        socket.emit("room-error", { message: "Error al conectar a la sala" })
      }
    })

    // WebRTC Signaling
    socket.on("offer", (data) => {
      console.log(`📞 Oferta enviada de ${socket.id} a ${data.targetId}`)
      socket.to(data.targetId).emit("receive-offer", {
        offer: data.offer,
        fromId: socket.id,
      })
    })

    socket.on("answer", (data) => {
      console.log(`✅ Respuesta enviada de ${socket.id} a ${data.targetId}`)
      socket.to(data.targetId).emit("receive-answer", {
        answer: data.answer,
        fromId: socket.id,
      })
    })

    socket.on("ice-candidate", (data) => {
      console.log(`🧊 Candidato ICE enviado de ${socket.id} a ${data.targetId}`)
      socket.to(data.targetId).emit("receive-ice-candidate", {
        candidate: data.candidate,
        fromId: socket.id,
      })
    })

    // Chat messages
    socket.on("chat-message", (data) => {
      console.log(`💬 Mensaje de ${socket.id}: ${data.message}`)
      socket.to(data.targetId).emit("chat-message", data.message)
    })

    // Remote control
    socket.on("remote-control-request", (data) => {
      console.log(`🖱️ Solicitud de control remoto de ${socket.id} a ${data.targetId}`)
      
      // Obtener información del usuario solicitante
      const requestingUser = userConnections.get(socket.id)
      const targetUser = userConnections.get(data.targetId)
      
      // Enviar notificación mejorada al usuario objetivo
      socket.to(data.targetId).emit("remote-control-request", {
        fromId: socket.id,
        fromUser: requestingUser,
        timestamp: new Date().toISOString(),
        message: `Usuario ${socket.id} solicita tomar control de tu dispositivo`,
      })
      
      // Notificación push si está disponible
      if (targetUser && targetUser.pushSubscription) {
        // Aquí se enviaría la notificación push
        console.log(`📱 Enviando notificación push a ${data.targetId}`)
      }
    })

    socket.on("remote-control-response", (data) => {
      console.log(`🖱️ Respuesta de control remoto: ${data.allowed}`)
      socket.to(data.targetId).emit("remote-control-response", {
        allowed: data.allowed,
        fromId: socket.id,
      })
    })

    // Mouse and keyboard events for remote control
    socket.on("remote-input", (data) => {
      socket.to(data.targetId).emit("remote-input", {
        inputData: data.inputData,
        fromId: socket.id,
      })
    })

    // Screen sharing events
    socket.on("screen-share-started", (data) => {
      console.log(`📺 ${socket.id} comenzó a compartir pantalla`)
      socket.to(data.targetId).emit("screen-share-started", {
        fromId: socket.id,
      })
    })

    socket.on("screen-share-stopped", (data) => {
      console.log(`📺 ${socket.id} dejó de compartir pantalla`)
      socket.to(data.targetId).emit("screen-share-stopped", {
        fromId: socket.id,
      })
    })

    // Heartbeat/ping
    socket.on("ping", () => {
      socket.emit("pong")
    })

    // Get room info
    socket.on("get-room-info", (roomCode) => {
      const room = activeRooms.get(roomCode)
      if (room) {
        socket.emit("room-info", {
          roomCode: room.roomCode,
          status: room.status,
          createdAt: room.createdAt,
          hasHost: !!room.hostId,
          hasGuest: !!room.guestId,
        })
      } else {
        socket.emit("room-error", { message: "Sala no encontrada" })
      }
    })

    // Disconnect handling
    socket.on("disconnect", (reason) => {
      console.log(`❌ Usuario desconectado: ${socket.id} - Razón: ${reason}`)

      // Clean up rooms
      for (const [roomCode, room] of activeRooms.entries()) {
        if (room.hostId === socket.id || room.guestId === socket.id) {
          // Notify other user
          const otherUserId = room.hostId === socket.id ? room.guestId : room.hostId
          if (otherUserId) {
            socket.to(otherUserId).emit("user-disconnected", {
              userId: socket.id,
              message: "El otro usuario se ha desconectado",
            })
          }

          // Remove room if host disconnects, or just remove guest
          if (room.hostId === socket.id) {
            console.log(`🗑️ Eliminando sala ${roomCode} (host desconectado)`)
            activeRooms.delete(roomCode)
          } else {
            console.log(`👤 Invitado salió de la sala ${roomCode}`)
            room.guestId = null
            room.status = "waiting"
          }
        }
      }

      // Remove user connection
      userConnections.delete(socket.id)
    })

    // Error handling
    socket.on("error", (error) => {
      console.error(`❌ Error en socket ${socket.id}:`, error)
    })
  })

  // Cleanup inactive rooms every 30 minutes
  setInterval(
    () => {
      const now = new Date()
      for (const [roomCode, room] of activeRooms.entries()) {
        const roomAge = now.getTime() - room.createdAt.getTime()
        const maxAge = 30 * 60 * 1000 // 30 minutes

        if (roomAge > maxAge && room.status === "waiting") {
          console.log(`🧹 Limpiando sala inactiva: ${roomCode}`)
          activeRooms.delete(roomCode)
        }
      }
    },
    5 * 60 * 1000,
  ) // Check every 5 minutes

  // Server status endpoint
  httpServer.on("request", (req, res) => {
    if (req.url === "/api/status") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          status: "online",
          server: "FULLASISTENTE",
          developer: "Armando Ovalle",
          whatsapp: "+57 305 289 1719",
          activeRooms: activeRooms.size,
          connectedUsers: userConnections.size,
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        }),
      )
      return
    }
  })

  const PORT = process.env.SOCKET_PORT || process.env.PORT || 3001
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log("🎉 ================================")
    console.log("🚀 FULLASISTENTE Server ACTIVO")
    console.log(`🌐 Puerto: ${PORT}`)
    console.log("👨‍💻 Desarrollador: Armando Ovalle")
    console.log("📱 WhatsApp: +57 305 289 1719")
    console.log("💬 Mensaje: 'hola quiero asistencia'")
    console.log("🔗 Estado: http://localhost:" + PORT + "/api/status")
    console.log("🎉 ================================")
  })

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("🛑 Cerrando servidor FULLASISTENTE...")
    httpServer.close(() => {
      console.log("✅ Servidor cerrado correctamente")
      process.exit(0)
    })
  })

  process.on("SIGINT", () => {
    console.log("🛑 Cerrando servidor FULLASISTENTE...")
    httpServer.close(() => {
      console.log("✅ Servidor cerrado correctamente")
      process.exit(0)
    })
  })
})
