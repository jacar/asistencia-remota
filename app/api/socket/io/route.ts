import { NextRequest, NextResponse } from "next/server"
import { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { NextApiResponse } from "next"

export const dynamic = "force-dynamic"

interface SocketServer extends NetServer {
  io?: SocketIOServer
}

interface SocketWithIO extends NextApiResponse {
  socket: SocketServer
}

export async function GET(req: NextRequest) {
  try {
    const res = NextResponse.next() as any

    if (!res.socket.server.io) {
      console.log("🚀 Initializing Socket.IO server...")
      
      const io = new SocketIOServer(res.socket.server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
        transports: ["websocket", "polling"],
      })

      res.socket.server.io = io

      io.on("connection", (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`)

        // Unirse a una sala
        socket.on("join-room", (roomId: string) => {
          socket.join(roomId)
          console.log(`👥 Client ${socket.id} joined room: ${roomId}`)
          
          // Notificar a otros en la sala
          socket.to(roomId).emit("user-joined", {
            userId: socket.id,
            roomId,
            timestamp: new Date()
          })
        })

        // Enviar notificación de control remoto
        socket.on("control-request", (data: { roomId: string; message: string }) => {
          console.log(`🎮 Control request in room ${data.roomId}:`, data)
          
          // Enviar a todos en la sala excepto al emisor
          socket.to(data.roomId).emit("control-request", {
            ...data,
            senderId: socket.id,
            timestamp: new Date()
          })
        })

        // Respuesta a solicitud de control
        socket.on("control-response", (data: { 
          roomId: string; 
          accepted: boolean; 
          message: string 
        }) => {
          console.log(`✅ Control response in room ${data.roomId}:`, data)
          
          // Enviar a todos en la sala excepto al emisor
          socket.to(data.roomId).emit("control-response", {
            ...data,
            senderId: socket.id,
            timestamp: new Date()
          })
        })

        // Mensaje de chat
        socket.on("chat-message", (data: { roomId: string; message: string; sender: string }) => {
          console.log(`💬 Chat message in room ${data.roomId}:`, data)
          
          // Enviar a todos en la sala
          io.to(data.roomId).emit("chat-message", {
            ...data,
            senderId: socket.id,
            timestamp: new Date()
          })
        })

        // Desconexión
        socket.on("disconnect", () => {
          console.log(`🔌 Client disconnected: ${socket.id}`)
        })
      })

      console.log("✅ Socket.IO server initialized")
    }

    return NextResponse.json({ 
      success: true, 
      message: "Socket.IO server is running",
      connectedClients: res.socket.server.io.engine.clientsCount
    })
  } catch (error) {
    console.error("Error initializing Socket.IO:", error)
    return NextResponse.json({ error: "Failed to initialize Socket.IO" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log básico para debugging
    console.log("Socket.IO request:", body)

    return NextResponse.json({
      message: "Solicitud recibida",
      developer: "Armando Ovalle",
      whatsapp: "+57 305 289 1719",
      data: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error procesando solicitud",
        developer: "Armando Ovalle",
        whatsapp: "+57 305 289 1719",
        message: "Contacta por WhatsApp para asistencia",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
