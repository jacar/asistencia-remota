"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Monitor, MessageCircle, Upload, Maximize2, Minimize2, MousePointer, Hand, Copy } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useSessionStore } from "../store/sessionStore"
import { useSocket } from "../hooks/useSocket"
import { useWebRTC } from "../hooks/useWebRTC"
import RemoteDesktop from "../components/remote/RemoteDesktop"
import ScreenShare from "../components/remote/ScreenShare"
import Chat from "../components/chat/Chat"
import FileTransfer from "../components/files/FileTransfer"
import toast from "react-hot-toast"

const Session = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentSession, getSession, endSession } = useSessionStore()
  const [activeTab, setActiveTab] = useState("desktop")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isControlling, setIsControlling] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState([])
  const [sessionSettings, setSessionSettings] = useState({
    allowControl: true,
    allowFileTransfer: true,
    allowChat: true,
  })

  // Socket and WebRTC hooks
  const socket = useSocket()
  const {
    localStream,
    remoteStream,
    isConnected,
    isHost,
    startScreenShare,
    stopScreenShare,
    requestRemoteControl,
    sendRemoteInput,
    initializeConnection,
    cleanup,
  } = useWebRTC(sessionId, socket)

  const sessionContainerRef = useRef(null)

  useEffect(() => {
    if (sessionId) {
      getSession(sessionId)
    }
  }, [sessionId, getSession])

  useEffect(() => {
    if (currentSession && socket) {
      // Join session room
      socket.emit("join-session", { sessionId })

      // Initialize WebRTC connection
      initializeConnection()

      // Socket event listeners
      socket.on("user-joined", (data) => {
        setConnectedUsers((prev) => [...prev, data.user])
        toast.success(`${data.user.username} joined the session`)
      })

      socket.on("user-left", (data) => {
        setConnectedUsers((prev) => prev.filter((u) => u.id !== data.user.id))
        toast.info(`${data.user.username} left the session`)
      })

      socket.on("session-joined", (data) => {
        setConnectedUsers(data.connectedUsers)
        setSessionSettings({
          allowControl: data.session.allowControl,
          allowFileTransfer: data.session.allowFileTransfer,
          allowChat: data.session.allowChat,
        })
      })

      socket.on("remote-control-request", (data) => {
        const accept = window.confirm(`${data.fromUserId} wants to control your desktop. Allow?`)
        socket.emit("remote-control-response", {
          sessionId,
          accepted: accept,
          targetUserId: data.fromUserId,
        })
      })

      socket.on("remote-control-response", (data) => {
        if (data.accepted) {
          setIsControlling(true)
          toast.success("Remote control granted!")
        } else {
          toast.error("Remote control denied")
        }
      })

      return () => {
        socket.off("user-joined")
        socket.off("user-left")
        socket.off("session-joined")
        socket.off("remote-control-request")
        socket.off("remote-control-response")
        cleanup()
      }
    }
  }, [currentSession, socket, sessionId, initializeConnection, cleanup])

  const handleEndSession = async () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      try {
        await endSession(sessionId)
        toast.success("Session ended")
        navigate("/dashboard")
      } catch (error) {
        toast.error("Failed to end session")
      }
    }
  }

  const handleLeaveSession = () => {
    if (window.confirm("Are you sure you want to leave this session?")) {
      socket?.emit("leave-session", { sessionId })
      navigate("/dashboard")
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      sessionContainerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleRequestControl = () => {
    if (sessionSettings.allowControl) {
      requestRemoteControl()
    } else {
      toast.error("Remote control is not allowed in this session")
    }
  }

  const copySessionCode = () => {
    if (currentSession?.sessionCode) {
      navigator.clipboard.writeText(currentSession.sessionCode)
      toast.success("Session code copied to clipboard!")
    }
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const isSessionHost = currentSession.host.id === user?.id
  const otherUser = isSessionHost ? currentSession.guest : currentSession.host

  return (
    <div ref={sessionContainerRef} className={`min-h-screen bg-gray-900 text-white ${isFullscreen ? "p-0" : "p-4"}`}>
      {/* Header */}
      {!isFullscreen && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Monitor className="h-6 w-6 text-primary-400" />
                <span className="text-lg font-semibold">Session {currentSession.sessionCode}</span>
                <button
                  onClick={copySessionCode}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Copy session code"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="status-online"></div>
                <span className="text-sm text-gray-300">{connectedUsers.length + 1} connected</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isConnected ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
                }`}
              >
                {isConnected ? "Connected" : "Connecting..."}
              </div>

              {/* Control Status */}
              {isControlling && (
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">Controlling</div>
              )}

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>

              {/* End/Leave Session */}
              {isSessionHost ? (
                <button
                  onClick={handleEndSession}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
                >
                  End Session
                </button>
              ) : (
                <button
                  onClick={handleLeaveSession}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
                >
                  Leave Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex ${isFullscreen ? "h-screen" : "h-[calc(100vh-200px)]"}`}>
        {/* Left Panel - Remote Desktop */}
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
          {activeTab === "desktop" && (
            <RemoteDesktop
              sessionId={sessionId}
              remoteStream={remoteStream}
              isControlling={isControlling}
              onRemoteInput={sendRemoteInput}
              isFullscreen={isFullscreen}
            />
          )}

          {activeTab === "screen" && (
            <ScreenShare
              sessionId={sessionId}
              localStream={localStream}
              remoteStream={remoteStream}
              isHost={isSessionHost}
              onStartShare={startScreenShare}
              onStopShare={stopScreenShare}
            />
          )}
        </div>

        {/* Right Panel - Controls */}
        {!isFullscreen && (
          <div className="w-80 ml-4 space-y-4">
            {/* Tab Navigation */}
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("desktop")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "desktop"
                      ? "bg-primary-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <Monitor className="h-4 w-4 mx-auto mb-1" />
                  Desktop
                </button>
                <button
                  onClick={() => setActiveTab("screen")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "screen"
                      ? "bg-primary-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <Monitor className="h-4 w-4 mx-auto mb-1" />
                  Screen
                </button>
                {sessionSettings.allowChat && (
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "chat"
                        ? "bg-primary-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4 mx-auto mb-1" />
                    Chat
                  </button>
                )}
                {sessionSettings.allowFileTransfer && (
                  <button
                    onClick={() => setActiveTab("files")}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "files"
                        ? "bg-primary-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <Upload className="h-4 w-4 mx-auto mb-1" />
                    Files
                  </button>
                )}
              </div>
            </div>

            {/* Control Panel */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Controls</h3>

              <div className="space-y-3">
                {/* Remote Control */}
                {!isSessionHost && sessionSettings.allowControl && (
                  <button
                    onClick={handleRequestControl}
                    disabled={isControlling}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isControlling
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isControlling ? (
                      <>
                        <Hand className="h-4 w-4 inline mr-2" />
                        Controlling
                      </>
                    ) : (
                      <>
                        <MousePointer className="h-4 w-4 inline mr-2" />
                        Request Control
                      </>
                    )}
                  </button>
                )}

                {/* Screen Share (Host only) */}
                {isSessionHost && (
                  <button
                    onClick={localStream ? stopScreenShare : startScreenShare}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      localStream
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    <Monitor className="h-4 w-4 inline mr-2" />
                    {localStream ? "Stop Sharing" : "Share Screen"}
                  </button>
                )}

                {/* Session Info */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Role:</span>
                      <span>{isSessionHost ? "Host" : "Guest"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Connected:</span>
                      <span>{otherUser?.username || "Waiting..."}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Started:</span>
                      <span>{new Date(currentSession.startedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            {activeTab === "chat" && sessionSettings.allowChat && (
              <div className="bg-gray-800 rounded-lg h-96">
                <Chat sessionId={sessionId} socket={socket} />
              </div>
            )}

            {/* File Transfer Panel */}
            {activeTab === "files" && sessionSettings.allowFileTransfer && (
              <div className="bg-gray-800 rounded-lg">
                <FileTransfer sessionId={sessionId} socket={socket} />
              </div>
            )}

            {/* Connected Users */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Participants</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="status-online"></div>
                  <span className="text-sm">{user?.username} (You)</span>
                  {isSessionHost && <span className="text-xs bg-primary-600 px-2 py-1 rounded-full">Host</span>}
                </div>
                {connectedUsers.map((connectedUser) => (
                  <div key={connectedUser.id} className="flex items-center space-x-2">
                    <div className="status-online"></div>
                    <span className="text-sm">{connectedUser.username}</span>
                  </div>
                ))}
                {connectedUsers.length === 0 && !isSessionHost && (
                  <div className="flex items-center space-x-2">
                    <div className="status-online"></div>
                    <span className="text-sm">{currentSession.host.username}</span>
                    <span className="text-xs bg-primary-600 px-2 py-1 rounded-full">Host</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Session
