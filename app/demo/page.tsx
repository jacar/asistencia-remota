"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Monitor, Users, MessageCircle, Share2, Copy, CheckCircle, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  text: string
  sender: string
  timestamp: Date
  isOwn: boolean
}

export default function Demo() {
  const [roomId, setRoomId] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [isConnected, setIsConnected] = useState(true) // Simulado como conectado
  const [connectedUsers, setConnectedUsers] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isHost, setIsHost] = useState(false)
  const [currentUser, setCurrentUser] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const whatsappNumber = "573052891719"
  const whatsappMessage = "hola quiero asistencia"
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  useEffect(() => {
    // Simular conexión establecida
    setIsConnected(true)

    // Generar nombre de usuario aleatorio
    const userNames = ["Ana", "Carlos", "María", "Diego", "Elena", "Fernando"]
    setCurrentUser(userNames[Math.floor(Math.random() * userNames.length)])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(id)
    setIsHost(true)
    setConnectedUsers([currentUser])

    // Simular mensaje de bienvenida
    const welcomeMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: `¡Sesión de asistencia creada! Comparte el código ${id} para que otros se unan.`,
      sender: "Sistema",
      timestamp: new Date(),
      isOwn: false,
    }
    setMessages([welcomeMessage])
  }

  const joinRoom = () => {
    if (!joinRoomId.trim()) {
      alert("Por favor ingresa un código de sesión")
      return
    }

    setRoomId(joinRoomId.trim().toUpperCase())
    setIsHost(false)
    setConnectedUsers(["Técnico", currentUser])

    // Simular mensaje de unión
    const joinMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: `${currentUser} se ha conectado a la sesión de asistencia.`,
      sender: "Sistema",
      timestamp: new Date(),
      isOwn: false,
    }
    setMessages([joinMessage])

    // Simular mensaje del técnico
    setTimeout(() => {
      const hostMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: "¡Hola! Soy tu técnico de soporte. ¿En qué puedo ayudarte hoy? 👋",
        sender: "Técnico",
        timestamp: new Date(),
        isOwn: false,
      }
      setMessages((prev) => [...prev, hostMessage])
    }, 1000)
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newMessage.trim(),
      sender: currentUser,
      timestamp: new Date(),
      isOwn: true,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simular respuesta automática del técnico
    if (roomId && Math.random() > 0.3) {
      setTimeout(
        () => {
          const responses = [
            "Perfecto, entiendo tu consulta 👍",
            "Déjame revisar eso para ti",
            "Excelente, vamos a solucionarlo",
            "¿Puedes compartir tu pantalla para ayudarte mejor?",
            "Voy a tomar control remoto para asistirte",
            "¡Problema resuelto! ¿Algo más en lo que pueda ayudarte?",
            "Te voy a enviar las instrucciones por WhatsApp",
          ]

          const autoResponse: Message = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: responses[Math.floor(Math.random() * responses.length)],
            sender: isHost ? "Cliente" : "Técnico",
            timestamp: new Date(),
            isOwn: false,
          }
          setMessages((prev) => [...prev, autoResponse])
        },
        1000 + Math.random() * 2000,
      )
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    alert("¡Código de sesión copiado al portapapeles!")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Volver</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Monitor className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">FULLASISTENTE Demo</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm text-gray-600">{isConnected ? "Conectado" : "Desconectado"}</span>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-green-500 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Demo de Asistencia Remota</h1>
          <p className="text-lg text-gray-600">Experimenta el poder de la asistencia técnica remota en tiempo real</p>
        </div>

        {!roomId ? (
          /* Room Setup */
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Room */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Crear Sesión de Asistencia</h3>
                  <p className="text-sm text-gray-500">Crea una nueva sesión para brindar soporte técnico</p>
                </div>
                <button
                  onClick={generateRoomId}
                  disabled={!isConnected}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Monitor className="h-5 w-5 mr-2" />
                  Crear Sesión de Soporte
                </button>
              </div>

              {/* Join Room */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Unirse a Sesión</h3>
                  <p className="text-sm text-gray-500">Ingresa el código que te proporcionó el técnico</p>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    placeholder="Código de sesión"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center text-lg"
                    maxLength={6}
                  />
                  <button
                    onClick={joinRoom}
                    disabled={!isConnected || !joinRoomId.trim()}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Conectar con Técnico
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Instructions */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Instrucciones del Demo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-semibold mb-2">Como Técnico de Soporte:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Haz clic en "Crear Sesión de Soporte"</li>
                    <li>Copia el código generado</li>
                    <li>Compártelo con el cliente</li>
                    <li>¡Comienza a brindar asistencia!</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Como Cliente:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Ingresa el código que te dio el técnico</li>
                    <li>Haz clic en "Conectar con Técnico"</li>
                    <li>Describe tu problema en el chat</li>
                    <li>Permite el acceso remoto si es necesario</li>
                  </ol>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>¿Necesitas asistencia real?</strong>{" "}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-600"
                  >
                    Contáctanos por WhatsApp: +57 305 289 1719
                  </a>
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Session */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-6 w-6 text-blue-600" />
                      <span className="font-medium">Sesión de Asistencia: {roomId}</span>
                      <button
                        onClick={copyRoomId}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copiar código de sesión"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isHost ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isHost ? "Técnico" : "Cliente"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center text-white">
                      <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Pantalla Compartida</h3>
                      <p className="text-sm opacity-75">
                        {isHost
                          ? 'Aquí verías la pantalla del cliente. Haz clic en "Tomar Control" para asistir.'
                          : "Aquí el técnico puede ver tu pantalla y ayudarte a resolver el problema."}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    {isHost ? (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        <Share2 className="h-4 w-4" />
                        <span>Tomar Control Remoto</span>
                      </button>
                    ) : (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                        <Users className="h-4 w-4" />
                        <span>Permitir Acceso Remoto</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Session Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Sesión</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Código de Sesión:</span>
                    <span className="text-sm font-mono font-medium">{roomId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rol:</span>
                    <span className="text-sm font-medium">{isHost ? "Técnico de Soporte" : "Cliente"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usuario:</span>
                    <span className="text-sm font-medium">{currentUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Conectados:</span>
                    <span className="text-sm font-medium">{connectedUsers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Conectado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Contact */}
              <div className="bg-green-50 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-3">¿Necesitas Ayuda Real?</h3>
                <p className="text-sm text-green-700 mb-4">
                  Contacta a nuestro técnico especializado por WhatsApp para asistencia personalizada.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar por WhatsApp
                </a>
                <p className="text-xs text-green-600 mt-2 text-center">Armando Ovalle - Técnico Especializado</p>
              </div>

              {/* Chat */}
              <div className="bg-white rounded-lg shadow-lg">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Chat de Asistencia</span>
                    <span className="text-sm text-gray-500">({messages.length})</span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto space-y-3 mb-4 border rounded-md p-3 bg-gray-50">
                    {messages.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Inicia la conversación describiendo tu problema
                      </p>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg ${
                              message.isOwn
                                ? "bg-blue-600 text-white"
                                : message.sender === "Sistema"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-200 text-gray-900"
                            }`}
                          >
                            {!message.isOwn && message.sender !== "Sistema" && (
                              <div className="text-xs font-medium mb-1 opacity-75">{message.sender}</div>
                            )}
                            <div className="text-sm">{message.text}</div>
                            <div className={`text-xs mt-1 opacity-75`}>{formatTime(message.timestamp)}</div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Describe tu problema o consulta..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      maxLength={200}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                  <div className="mt-2 text-xs text-gray-500 text-right">{newMessage.length}/200</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Demo */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Características de FULLASISTENTE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Control Remoto</h3>
              <p className="text-sm text-gray-600">Acceso completo al escritorio del cliente</p>
            </div>

            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Asistencia Personalizada</h3>
              <p className="text-sm text-gray-600">Soporte técnico uno a uno</p>
            </div>

            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Chat en Tiempo Real</h3>
              <p className="text-sm text-gray-600">Comunicación directa durante la asistencia</p>
            </div>

            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Acceso Seguro</h3>
              <p className="text-sm text-gray-600">Conexiones encriptadas y códigos únicos</p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          title="Contactar por WhatsApp"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      </div>
    </div>
  )
}
