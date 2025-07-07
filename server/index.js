const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})

const PORT = process.env.PORT || 3001

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  }),
)

app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
})
app.use("/api/", limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files for uploads
app.use("/uploads", express.static("uploads"))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Basic routes for demo
app.get("/api/demo", (req, res) => {
  res.json({
    message: "RemoteConnect API is running!",
    features: ["Remote Desktop Control", "Screen Sharing", "File Transfer", "Live Chat", "Multi-User Sessions"],
  })
})

// Variables para gestión de host y permisos
let hostSocketId = null;
const pendingConnections = new Map(); // socketId -> { ip, socket }

// Socket.io connection handling
io.on("connection", (socket) => {
  // Detectar IP del cliente
  const clientIp = socket.handshake.address;
  console.log(`User connected: ${socket.id} from IP: ${clientIp}`);

  // Registrar el primer usuario como host
  if (!hostSocketId) {
    hostSocketId = socket.id;
    console.log(`Host registrado: ${hostSocketId}`);
  }

  // Si no es el host, pedir permiso al host
  if (socket.id !== hostSocketId) {
    // Guardar conexión pendiente
    pendingConnections.set(socket.id, { ip: clientIp, socket });
    // Notificar al host
    io.to(hostSocketId).emit("external-connection-request", {
      socketId: socket.id,
      ip: clientIp,
    });
    // Esperar respuesta del host
    socket.data.permissionGranted = false; // Por defecto, no permitido
    // No permitir acceso a salas hasta que el host acepte
    socket.on("join-room", (roomId) => {
      if (!socket.data.permissionGranted) {
        socket.emit("permission-denied", { message: "Esperando aprobación del host." });
        return;
      }
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", socket.id);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });
  } else {
    // El host puede unirse normalmente
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", socket.id);
      console.log(`Host ${socket.id} joined room ${roomId}`);
    });
  }

  // Manejar respuesta del host
  socket.on("external-connection-response", ({ socketId, allowed }) => {
    const pending = pendingConnections.get(socketId);
    if (pending) {
      if (allowed) {
        pending.socket.data.permissionGranted = true;
        pending.socket.emit("permission-granted", { message: "Conexión aprobada por el host." });
      } else {
        pending.socket.emit("permission-denied", { message: "Conexión rechazada por el host." });
        pending.socket.disconnect(true);
      }
      pendingConnections.delete(socketId);
    }
  });

  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", data)
  })

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", data)
  })

  socket.on("ice-candidate", (data) => {
    socket.to(data.roomId).emit("ice-candidate", data)
  })

  socket.on("chat-message", (data) => {
    io.to(data.roomId).emit("chat-message", {
      ...data,
      timestamp: new Date().toISOString(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    if (socket.id === hostSocketId) {
      hostSocketId = null;
      console.log("Host desconectado. Se podrá registrar un nuevo host.");
    }
    pendingConnections.delete(socket.id);
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error)
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RemoteConnect Server running on port ${PORT}`)
  console.log(`📡 Socket.io server ready`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
})

module.exports = { app, server, io }
