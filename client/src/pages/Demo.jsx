"use client"

import { useState, useEffect } from "react"
import { Monitor, Users, MessageCircle, Share2, Copy, CheckCircle } from "lucide-react"
import { io } from "socket.io-client"
import toast from "react-hot-toast"

const Demo = () => {
  const [socket, setSocket] = useState(null)
  const [roomId, setRoomId] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isHost, setIsHost] = useState(false)

  useEffect(() => {
    // Connect to socket
    const newSocket = io("http://localhost:3001")
    setSocket(newSocket)

    newSocket.on("connect", () => {
      setIsConnected(true)
      toast.success("Connected to server!")
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
      toast.error("Disconnected from server")
    })

    newSocket.on("user-joined", (userId) => {
      setConnectedUsers((prev) => [...prev, userId])
      toast.success("User joined the session")
    })

    newSocket.on("chat-message", (message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(id)
    setIsHost(true)
    if (socket) {
      socket.emit("join-room", id)
      toast.success(`Room created: ${id}`)
    }
  }

  const joinRoom = () => {
    if (!joinRoomId.trim()) {
      toast.error("Please enter a room ID")
      return
    }

    setRoomId(joinRoomId.trim().toUpperCase())
    setIsHost(false)
    if (socket) {
      socket.emit("join-room", joinRoomId.trim().toUpperCase())
      toast.success(`Joined room: ${joinRoomId.trim().toUpperCase()}`)
    }
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !roomId) return

    const message = {
      text: newMessage.trim(),
      sender: isHost ? "Host" : "Guest",
      roomId: roomId,
    }

    socket.emit("chat-message", message)
    setNewMessage("")
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    toast.success("Room ID copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">RemoteConnect Demo</h1>
          <p className="text-lg text-gray-600">Experience the power of web-based remote desktop sharing</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-sm text-gray-600">{isConnected ? "Connected to server" : "Disconnected"}</span>
          </div>
        </div>

        {!roomId ? (
          /* Room Setup */
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Room */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Host a Session</h3>
                  <p className="text-sm text-gray-500">Create a new remote desktop session</p>
                </div>
                <div className="card-content">
                  <button
                    onClick={generateRoomId}
                    disabled={!isConnected}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <Monitor className="h-5 w-5" />
                    <span>Create Session</span>
                  </button>
                </div>
              </div>

              {/* Join Room */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Join a Session</h3>
                  <p className="text-sm text-gray-500">Enter a session ID to join</p>
                </div>
                <div className="card-content">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                      placeholder="Enter session ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-center"
                      maxLength={6}
                    />
                    <button
                      onClick={joinRoom}
                      disabled={!isConnected || !joinRoomId.trim()}
                      className="w-full btn-secondary flex items-center justify-center space-x-2"
                    >
                      <Users className="h-5 w-5" />
                      <span>Join Session</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Session */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Area */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-6 w-6 text-primary-600" />
                      <span className="font-medium">Session: {roomId}</span>
                      <button
                        onClick={copyRoomId}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copy session ID"
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
                        {isHost ? "Host" : "Guest"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Remote Desktop View</h3>
                      <p className="text-sm opacity-75">
                        {isHost
                          ? "Your screen would be shared here. Click 'Start Sharing' to begin."
                          : "The host's screen will appear here when they start sharing."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center space-x-4">
                    {isHost ? (
                      <button className="btn-primary flex items-center space-x-2">
                        <Share2 className="h-4 w-4" />
                        <span>Start Sharing</span>
                      </button>
                    ) : (
                      <button className="btn-secondary flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Request Control</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Session Info */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Session Info</h3>
                </div>
                <div className="card-content">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Session ID:</span>
                      <span className="text-sm font-mono font-medium">{roomId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Role:</span>
                      <span className="text-sm font-medium">{isHost ? "Host" : "Guest"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Connected Users:</span>
                      <span className="text-sm font-medium">{connectedUsers.length + 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">Chat</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-48 overflow-y-auto space-y-2 border rounded-md p-3 bg-gray-50">
                      {messages.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center">No messages yet</p>
                      ) : (
                        messages.map((message, index) => (
                          <div key={`message-${index}-${message.sender}-${message.text}`} className="text-sm">
                            <span className="font-medium text-primary-600">{message.sender}:</span>
                            <span className="ml-2">{message.text}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Demo */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Demo Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Monitor className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Screen Sharing</h3>
              <p className="text-sm text-gray-600">Real-time screen sharing with WebRTC</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Multi-User</h3>
              <p className="text-sm text-gray-600">Multiple users in same session</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Live Chat</h3>
              <p className="text-sm text-gray-600">Real-time messaging during sessions</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Easy Sharing</h3>
              <p className="text-sm text-gray-600">Simple session codes for quick access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Demo
