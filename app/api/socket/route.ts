import type { NextRequest } from "next/server"
import { Server } from "socket.io"
import { createServer } from "http"

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Store active rooms and connections
const activeRooms = new Map()
const userConnections = new Map()

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id)

  // Store user connection
  userConnections.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
  })

  // Create room (host)
  socket.on("create-room", (roomCode) => {
    socket.join(roomCode)
    activeRooms.set(roomCode, {
      hostId: socket.id,
      guestId: null,
      createdAt: new Date(),
    })

    console.log(`Sala creada: ${roomCode} por ${socket.id}`)
    socket.emit("room-created", { roomCode, hostId: socket.id })
  })

  // Join room (guest)
  socket.on("join-room", (roomCode) => {
    const room = activeRooms.get(roomCode)

    if (room && !room.guestId) {
      socket.join(roomCode)
      room.guestId = socket.id

      console.log(`Usuario ${socket.id} se unió a la sala ${roomCode}`)

      // Notify both users
      socket.emit("room-joined", { roomCode, hostId: room.hostId })
      socket.to(room.hostId).emit("guest-joined", { guestId: socket.id })
    } else {
      socket.emit("room-error", { message: "Sala no encontrada o llena" })
    }
  })

  // WebRTC Signaling
  socket.on("offer", (data) => {
    socket.to(data.targetId).emit("receive-offer", {
      offer: data.offer,
      fromId: socket.id,
    })
  })

  socket.on("answer", (data) => {
    socket.to(data.targetId).emit("receive-answer", {
      answer: data.answer,
      fromId: socket.id,
    })
  })

  socket.on("ice-candidate", (data) => {
    socket.to(data.targetId).emit("receive-ice-candidate", {
      candidate: data.candidate,
      fromId: socket.id,
    })
  })

  // Chat messages
  socket.on("chat-message", (data) => {
    socket.to(data.targetId).emit("chat-message", data.message)
  })

  // Remote control
  socket.on("remote-control-request", (data) => {
    socket.to(data.targetId).emit("remote-control-request", {
      fromId: socket.id,
    })
  })

  socket.on("remote-control-response", (data) => {
    socket.to(data.targetId).emit("remote-control-response", {
      allowed: data.allowed,
      fromId: socket.id,
    })
  })

  // Mouse and keyboard events
  socket.on("remote-input", (data) => {
    socket.to(data.targetId).emit("remote-input", {
      inputData: data.inputData,
      fromId: socket.id,
    })
  })

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id)

    // Clean up rooms
    for (const [roomCode, room] of activeRooms.entries()) {
      if (room.hostId === socket.id || room.guestId === socket.id) {
        // Notify other user
        const otherUserId = room.hostId === socket.id ? room.guestId : room.hostId
        if (otherUserId) {
          socket.to(otherUserId).emit("user-disconnected", { userId: socket.id })
        }

        // Remove room if host disconnects, or just remove guest
        if (room.hostId === socket.id) {
          activeRooms.delete(roomCode)
        } else {
          room.guestId = null
        }
      }
    }

    // Remove user connection
    userConnections.delete(socket.id)
  })
})

// Start server on port 3001
const PORT = process.env.SOCKET_PORT || 3001
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Socket.IO ejecutándose en puerto ${PORT}`)
})

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      status: "Socket.IO server running",
      port: PORT,
      activeRooms: activeRooms.size,
      connectedUsers: userConnections.size,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  )
}
