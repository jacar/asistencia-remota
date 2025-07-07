"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Monitor,
  MessageCircle,
  Phone,
  Copy,
  Share,
  Users,
  Settings,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MousePointer,
  Home,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Server,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import NotificationContainer from "@/components/ui/notification-container"
import { useNotificationContext } from "@/contexts/notification-context"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useNotificationListener } from "@/hooks/use-notification-listener"
import { useSocket } from "@/hooks/use-socket"
import { SimpleRemoteControl } from "@/components/remote/simple-remote-control"
import { DebugPanel } from "@/components/ui/debug-panel"

export default function ControlPage() {
  // Estados principales
  const [roomCode, setRoomCode] = useState("")
  const [inputCode, setInputCode] = useState("")
  const [isHost, setIsHost] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [remoteControlEnabled, setRemoteControlEnabled] = useState(false)
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; message: string; sender: "me" | "remote"; timestamp: Date }>
  >([])
  const [chatInput, setChatInput] = useState("")
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [copied, setCopied] = useState(false)
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline" | "vercel">("checking")

  // Hook de notificaciones
  const { addNotification } = useNotificationContext()
  
  // Hook de notificaciones push
  const { 
    isSupported: pushSupported, 
    permission: pushPermission, 
    requestPermission: requestPushPermission,
    sendRemoteNotification 
  } = usePushNotifications()

  // Hook de WebSocket
  const {
    isConnected: socketConnected,
    isConnecting: socketConnecting,
    sendControlRequest: socketSendControlRequest,
    sendControlResponse: socketSendControlResponse,
    sendChatMessage: socketSendChatMessage,
    onControlRequest: socketOnControlRequest,
    onControlResponse: socketOnControlResponse,
    onChatMessage: socketOnChatMessage,
  } = useSocket(roomCode)

  // Función para habilitar control remoto cuando se acepta
  const enableRemoteControl = () => {
    setRemoteControlEnabled(true)
    addChatMessage("✅ Control remoto habilitado", "me")
    addChatMessage("🖱️ Ahora puedes controlar la computadora del cliente", "me")
  }

  // Listener de notificaciones entrantes
  useNotificationListener(roomCode, isHost, enableRemoteControl)

  // Referencias
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Configurar listeners de WebSocket
  useEffect(() => {
    if (!roomCode) return

    // Listener para solicitudes de control (solo cliente)
    socketOnControlRequest((data) => {
      console.log("🎯 Received control request via WebSocket:", data)
      if (!isHost) {
        addNotification({
          type: "warning",
          title: "Solicitud de Control Remoto",
          message: "El técnico está solicitando acceso para controlar tu computadora. ¿Permites el acceso?",
          duration: 30000,
          onAccept: () => {
            console.log("✅ Client accepted control request via WebSocket")
            socketSendControlResponse(true, "El cliente ha aceptado tu solicitud de control remoto")
            addNotification({
              type: "success",
              title: "Control Remoto Aceptado",
              message: "Has aceptado la solicitud de control remoto. El técnico ahora puede controlar tu computadora.",
              duration: 5000,
            })
          },
          onReject: () => {
            console.log("❌ Client rejected control request via WebSocket")
            socketSendControlResponse(false, "El cliente ha rechazado tu solicitud de control remoto")
            addNotification({
              type: "error",
              title: "Control Remoto Rechazado",
              message: "Has rechazado la solicitud de control remoto. Tu computadora permanece segura.",
              duration: 5000,
            })
          },
        })
      }
    })

    // Listener para respuestas de control (solo host)
    socketOnControlResponse((data) => {
      console.log("🎯 Received control response via WebSocket:", data)
      if (isHost) {
        addNotification({
          type: data.accepted ? "success" : "error",
          title: data.accepted ? "Control Remoto Aceptado" : "Control Remoto Rechazado",
          message: data.message,
          duration: 5000,
        })
        
        if (data.accepted) {
          enableRemoteControl()
        }
      }
    })

    // Listener para mensajes de chat
    socketOnChatMessage((data) => {
      console.log("💬 Received chat message via WebSocket:", data)
      addChatMessage(data.message, data.sender === "host" ? "remote" : "me")
    })
  }, [roomCode, isHost, socketOnControlRequest, socketOnControlResponse, socketOnChatMessage, socketSendControlResponse, addNotification])

  // Verificar estado del servidor
  const checkServerStatus = async () => {
    try {
      setServerStatus("checking")
      const response = await fetch("/api/socket/status")
      const data = await response.json()

      if (response.ok) {
        if (data.mode === "vercel") {
          setServerStatus("vercel")
          addChatMessage("🌐 Ejecutándose en Vercel - Modo demo activo", "me")
          addChatMessage("📱 Para asistencia real, contacta por WhatsApp", "me")
        } else {
          setServerStatus("online")
          addChatMessage("✅ Servidor FULLASISTENTE online", "me")
        }
      } else {
        setServerStatus("offline")
        addChatMessage("❌ Servidor no disponible", "me")
      }
    } catch (error) {
      console.error("Error verificando servidor:", error)
      setServerStatus("offline")
      addChatMessage("❌ Error verificando servidor", "me")
    }
  }

  // Inicializar
  useEffect(() => {
    checkServerStatus()
    addChatMessage("👋 Bienvenido a FULLASISTENTE", "me")
    addChatMessage("👨‍💻 Desarrollado por Armando Ovalle", "me")
    addChatMessage("📱 WhatsApp: +57 305 289 1719", "me")
  }, [])

  // Generar código de sala
  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(code)
    setIsHost(true)
    addChatMessage(`🔑 Código generado: ${code}`, "me")
    addChatMessage("📋 Copia este código y envíalo por WhatsApp", "me")
    addChatMessage("📱 WhatsApp: +57 305 289 1719", "me")
    addChatMessage("💬 Mensaje: 'hola quiero asistencia'", "me")
  }

  // Unirse a sala
  const joinRoom = () => {
    if (inputCode.length === 6) {
      setRoomCode(inputCode)
      setIsHost(false)
      addChatMessage(`🔗 Conectando a sala: ${inputCode}`, "me")

      if (serverStatus === "vercel") {
        addChatMessage("⚠️ Modo demo - Para asistencia real usar WhatsApp", "me")
      } else {
        addChatMessage("🔄 Estableciendo conexión...", "me")
        setConnectionStatus("connecting")
        // Simular conexión exitosa después de 2 segundos
        setTimeout(() => {
          setIsConnected(true)
          setConnectionStatus("connected")
          addChatMessage("✅ Conectado exitosamente", "me")
        }, 2000)
      }
    }
  }

  // Compartir pantalla
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setIsScreenSharing(true)
      addChatMessage("📺 Compartiendo pantalla", "me")

      // Detectar cuando se deja de compartir
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false)
        addChatMessage("📺 Dejó de compartir pantalla", "me")
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null
        }
      }
    } catch (error) {
      console.error("Error al compartir pantalla:", error)
      addChatMessage("❌ Error al acceder a la pantalla", "me")
      addChatMessage("💡 Asegúrate de permitir el acceso", "me")
    }
  }

  // Detener compartir pantalla
  const stopScreenShare = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
      setIsScreenSharing(false)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
      addChatMessage("📺 Dejó de compartir pantalla", "me")
    }
  }

  // Solicitar control remoto
  const requestRemoteControl = async () => {
    console.log("🎮 Requesting remote control...")
    
    if (serverStatus === "vercel") {
      addChatMessage("⚠️ Control remoto no disponible en modo demo", "me")
      addChatMessage("📱 Contacta por WhatsApp para asistencia real", "me")
      return
    }

    // Solo el técnico (host) puede solicitar control
    if (!isHost) {
      addChatMessage("❌ Solo el técnico puede solicitar control remoto", "me")
      return
    }

    if (!roomCode) {
      addChatMessage("❌ No hay sala activa para enviar solicitud", "me")
      return
    }

    // Solicitar permisos de notificación si no están concedidos
    if (pushSupported && pushPermission !== "granted") {
      const granted = await requestPushPermission()
      if (!granted) {
        addChatMessage("⚠️ Se requieren permisos de notificación para el control remoto", "me")
        return
      }
    }

    // Intentar enviar por WebSocket primero
    if (socketConnected) {
      console.log("📤 Sending control request via WebSocket")
      socketSendControlRequest("El técnico está solicitando acceso para controlar tu computadora")
      addChatMessage("🖱️ Solicitud de control remoto enviada al cliente", "me")
      addChatMessage("⏳ Esperando respuesta del cliente...", "me")
      return
    }

    // Fallback a API REST
    try {
      console.log(`📤 Sending control request via API to room: ${roomCode}`)
      
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomCode,
          type: "control_request",
          message: "El técnico está solicitando acceso para controlar tu computadora",
          sender: "host"
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("✅ Control request sent successfully", result)
        addChatMessage("🖱️ Solicitud de control remoto enviada al cliente", "me")
        addChatMessage("⏳ Esperando respuesta del cliente...", "me")
        
        // Verificar notificaciones inmediatamente después de enviar
        setTimeout(() => {
          console.log("🔄 Checking for immediate response...")
        }, 1000)
      } else {
        console.error("❌ Failed to send control request:", response.status)
        addChatMessage("❌ Error al enviar solicitud de control", "me")
      }
    } catch (error) {
      console.error("Error sending control request:", error)
      addChatMessage("❌ Error al enviar solicitud de control", "me")
    }
  }

  // Enviar mensaje de chat
  const sendChatMessage = () => {
    if (chatInput.trim()) {
      const message = chatInput.trim()
      addChatMessage(message, "me")
      setChatInput("")

      // Enviar por WebSocket si está disponible
      if (socketConnected) {
        socketSendChatMessage(message, isHost ? "host" : "client")
      }

      // Respuesta automática del sistema
      setTimeout(() => {
        if (serverStatus === "vercel") {
          addChatMessage(
            "🤖 Sistema: Modo demo activo. Para asistencia real, contacta por WhatsApp: +57 305 289 1719",
            "remote",
          )
        } else {
          addChatMessage("🤖 Sistema: Mensaje recibido", "remote")
        }
      }, 1000)
    }
  }

  // Agregar mensaje al chat
  const addChatMessage = (message: string, sender: "me" | "remote") => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message,
        sender,
        timestamp: new Date(),
      },
    ])
  }

  // Copiar código
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      addChatMessage("📋 Código copiado al portapapeles", "me")
    } catch (error) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = roomCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      addChatMessage("📋 Código copiado", "me")
    }
  }

  // WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = "573052891719"
    const message = roomCode ? `hola quiero asistencia - Código: ${roomCode}` : "hola quiero asistencia"
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  FULLASISTENTE
                </span>
                <p className="text-xs text-gray-500">por Armando Ovalle</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Badge
                variant={
                  serverStatus === "online" ? "default" : serverStatus === "vercel" ? "secondary" : "destructive"
                }
                className="hidden sm:flex"
              >
                {serverStatus === "online" ? (
                  <>
                    <Server className="h-3 w-3 mr-1" />
                    Servidor Online
                  </>
                ) : serverStatus === "vercel" ? (
                  <>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Modo Vercel
                  </>
                ) : serverStatus === "offline" ? (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Servidor Offline
                  </>
                ) : (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Verificando...
                  </>
                )}
              </Badge>

              {serverStatus === "offline" && (
                <Button onClick={checkServerStatus} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Verificar
                </Button>
              )}

              <Button onClick={openWhatsApp} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>

              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Inicio</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Panel de Control */}
          <div className="lg:col-span-1 space-y-6">
                        {/* Panel de Debug */}
            <DebugPanel 
              roomCode={roomCode}
              isHost={isHost}
              socketConnected={socketConnected}
              socketConnecting={socketConnecting}
              serverStatus={serverStatus}
              connectionStatus={connectionStatus}
              remoteControlEnabled={remoteControlEnabled}
              onRefresh={checkServerStatus}
            />
            
            {/* Estado de Conexión */}
            <Card
              className={`border-l-4 ${
                serverStatus === "online"
                  ? "border-l-green-600"
                  : serverStatus === "vercel"
                    ? "border-l-blue-600"
                    : "border-l-red-600"
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  {serverStatus === "online" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : serverStatus === "vercel" ? (
                    <ExternalLink className="h-5 w-5 text-blue-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>Estado del Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Servidor:</span>
                  <Badge
                    variant={
                      serverStatus === "online" ? "default" : serverStatus === "vercel" ? "secondary" : "destructive"
                    }
                  >
                    {serverStatus === "online"
                      ? "Online"
                      : serverStatus === "vercel"
                        ? "Vercel Demo"
                        : serverStatus === "offline"
                          ? "Offline"
                          : "Verificando..."}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WebRTC:</span>
                  <Badge variant={connectionStatus === "connected" ? "default" : "secondary"}>
                    {connectionStatus === "connected" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Notificaciones:</span>
                  <Badge 
                    variant={
                      pushSupported && pushPermission === "granted" 
                        ? "default" 
                        : pushSupported && pushPermission === "denied"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {pushSupported && pushPermission === "granted" 
                      ? "Activas" 
                      : pushSupported && pushPermission === "denied"
                        ? "Denegadas"
                        : "No Soportadas"
                    }
                  </Badge>
                </div>
                {roomCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sala:</span>
                    <Badge variant="outline">{roomCode}</Badge>
                  </div>
                )}
                {serverStatus === "vercel" && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Modo Demo:</strong> Para asistencia técnica real, contacta por WhatsApp.
                    </p>
                  </div>
                )}
                {serverStatus === "offline" && (
                  <div className="pt-2">
                    <Button onClick={checkServerStatus} size="sm" className="w-full bg-transparent" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verificar Servidor
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generar/Unirse */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Control de Sesión</span>
                </CardTitle>
                <CardDescription>Genera un código para recibir ayuda o ingresa un código para asistir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!roomCode ? (
                  <>
                    <Button onClick={generateRoomCode} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Users className="h-4 w-4 mr-2" />
                      Generar Código (Recibir Ayuda)
                    </Button>

                    <Separator />

                    <div className="space-y-3">
                      <Input
                        placeholder="Código de 6 dígitos"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
                        maxLength={6}
                        className="text-center text-lg font-mono tracking-wider"
                      />
                      <Button
                        onClick={joinRoom}
                        disabled={inputCode.length !== 6}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {connectionStatus === "connecting" ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <Settings className="h-4 w-4 mr-2" />
                            Conectar (Dar Asistencia)
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border-2 border-dashed border-blue-200">
                      <p className="text-sm text-gray-600 mb-2">Código de Sesión:</p>
                      <p className="text-4xl font-bold text-blue-600 mb-4 font-mono tracking-wider">{roomCode}</p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={copyCode}
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                        >
                          {copied ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              ¡Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </>
                          )}
                        </Button>
                        <Button onClick={openWhatsApp} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>

                    {isHost && !isScreenSharing && (
                      <Button
                        onClick={startScreenShare}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Compartir Pantalla
                      </Button>
                    )}

                    {isHost && isScreenSharing && (
                      <Button onClick={stopScreenShare} variant="destructive" className="w-full">
                        <Share className="h-4 w-4 mr-2" />
                        Detener Compartir
                      </Button>
                    )}

                    {/* Panel de Control Remoto */}
                    {!isHost && isConnected && remoteControlEnabled && (
                      <SimpleRemoteControl />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Controles de Audio/Video */}
            {isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Controles de Sesión</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Botón de Solicitar Control Remoto */}
                    {isHost && !remoteControlEnabled && (
                      <Button
                        onClick={requestRemoteControl}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={serverStatus === "vercel"}
                      >
                        <MousePointer className="h-4 w-4 mr-2" />
                        Solicitar Control Remoto
                      </Button>
                    )}
                    
                    {/* Botón de prueba - siempre visible */}
                    <Button
                      onClick={requestRemoteControl}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MousePointer className="h-4 w-4 mr-2" />
                      🧪 PROBAR Solicitar Control
                    </Button>
                    
                    {/* Panel de Control Remoto cuando está habilitado */}
                    {remoteControlEnabled && (
                      <div className="space-y-2">
                        <Badge className="w-full justify-center bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Control Remoto Habilitado
                        </Badge>
                        <SimpleRemoteControl />
                      </div>
                    )}
                    
                    {/* Controles de Audio/Video */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        variant={audioEnabled ? "default" : "destructive"}
                        size="sm"
                        className="w-full"
                      >
                        {audioEnabled ? <Mic className="h-4 w-4 mr-1" /> : <MicOff className="h-4 w-4 mr-1" />}
                        <span className="text-xs">{audioEnabled ? "Audio" : "Mudo"}</span>
                      </Button>
                      <Button
                        onClick={() => setVideoEnabled(!videoEnabled)}
                        variant={videoEnabled ? "default" : "destructive"}
                        size="sm"
                        className="w-full"
                      >
                        {videoEnabled ? <Video className="h-4 w-4 mr-1" /> : <VideoOff className="h-4 w-4 mr-1" />}
                        <span className="text-xs">{videoEnabled ? "Video" : "Sin Video"}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat de Sesión</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto border rounded-lg p-3 space-y-3 bg-gray-50">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Los mensajes aparecerán aquí</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`text-sm p-3 rounded-lg max-w-[85%] ${
                            msg.sender === "me" ? "bg-blue-600 text-white ml-auto" : "bg-white text-gray-800 border"
                          }`}
                        >
                          <p className="break-words">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.sender === "me" ? "text-blue-100" : "text-gray-500"}`}>
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    />
                    <Button onClick={sendChatMessage} size="sm" disabled={!chatInput.trim()}>
                      Enviar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área de Video */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5" />
                    <span>{isHost ? "Tu Pantalla" : "Pantalla Remota"}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {remoteControlEnabled && (
                      <Badge className="bg-green-600 text-white">
                        <MousePointer className="h-3 w-3 mr-1" />
                        Control Activo
                      </Badge>
                    )}
                    <Badge variant={connectionStatus === "connected" ? "default" : "secondary"}>
                      {connectionStatus === "connected"
                        ? "WebRTC Conectado"
                        : connectionStatus === "connecting"
                          ? "Conectando..."
                          : "Desconectado"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-full">
                <div className="space-y-4 h-full">
                  {/* Video Local */}
                  {isScreenSharing && (
                    <div className="relative">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-48 bg-gray-900 rounded-lg object-contain"
                      />
                      <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                        <Share className="h-3 w-3 mr-1" />
                        Tu Pantalla
                      </Badge>
                    </div>
                  )}

                  {/* Video Remoto */}
                  <div className="relative flex-1">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-96 bg-gray-900 rounded-lg object-contain"
                      style={{ minHeight: "400px" }}
                    />

                    {serverStatus === "vercel" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                        <div className="text-center p-8">
                          <ExternalLink className="h-20 w-20 text-blue-600 mx-auto mb-6" />
                          <h3 className="text-xl font-semibold text-blue-700 mb-2">Modo Demo - Vercel</h3>
                          <p className="text-blue-600 max-w-md mb-4">
                            Esta es una demostración de FULLASISTENTE ejecutándose en Vercel.
                          </p>
                          <div className="space-y-3">
                            <Button onClick={openWhatsApp} className="bg-green-600 hover:bg-green-700 text-white">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Asistencia Real por WhatsApp
                            </Button>
                            <p className="text-sm text-blue-500">
                              WhatsApp: +57 305 289 1719
                              <br />
                              Mensaje: "hola quiero asistencia"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {serverStatus === "offline" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                        <div className="text-center p-8">
                          <Server className="h-20 w-20 text-red-500 mx-auto mb-6" />
                          <h3 className="text-xl font-semibold text-red-700 mb-2">Servidor No Disponible</h3>
                          <p className="text-red-600 max-w-md mb-4">
                            El servidor de FULLASISTENTE no está disponible en este momento.
                          </p>
                          <div className="space-y-3">
                            <Button onClick={openWhatsApp} className="bg-green-600 hover:bg-green-700 text-white">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contactar por WhatsApp
                            </Button>
                            <p className="text-sm text-red-500">
                              WhatsApp: +57 305 289 1719
                              <br />
                              Mensaje: "hola quiero asistencia"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {serverStatus === "online" && !isConnected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                        <div className="text-center p-8">
                          <Monitor className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {roomCode ? "Esperando Conexión" : "Iniciar Sesión"}
                          </h3>
                          <p className="text-gray-600 max-w-md mb-4">
                            {roomCode
                              ? "Comparte tu código con el técnico para establecer la conexión"
                              : "Genera un código para recibir ayuda o ingresa un código para dar asistencia"}
                          </p>
                          {roomCode && (
                            <div className="mt-4">
                              <Button onClick={openWhatsApp} className="bg-green-600 hover:bg-green-700 text-white">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Enviar por WhatsApp
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {isConnected && connectionStatus !== "connected" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                        <div className="text-center text-white p-8">
                          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Estableciendo Conexión</h3>
                          <p className="text-gray-300">Configurando video en tiempo real...</p>
                        </div>
                      </div>
                    )}

                    {connectionStatus === "connected" && (
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Conectado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Información del Desarrollador */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Soporte Técnico Profesional</h3>
          <p className="text-green-100 mb-6">
            Desarrollado por <span className="font-semibold">Armando Ovalle</span> - Especialista en Control Remoto y
            Asistencia Técnica
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={openWhatsApp} className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3">
              <Phone className="h-5 w-5 mr-2" />
              WhatsApp: +57 305 289 1719
            </Button>
            <div className="text-green-100">
              <span className="text-sm">Mensaje directo: </span>
              <span className="font-mono bg-white/20 px-2 py-1 rounded">
                {roomCode ? `hola quiero asistencia - Código: ${roomCode}` : "hola quiero asistencia"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {roomCode ? `Código: ${roomCode}` : "¿Necesitas ayuda?"}
        </span>
      </button>

      {/* Contenedor de Notificaciones */}
      <NotificationContainer />
    </div>
  )
}
