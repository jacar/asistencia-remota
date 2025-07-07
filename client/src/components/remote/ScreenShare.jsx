"use client"

import { useRef, useEffect, useState } from "react"
import { Monitor, Play, Square, AlertCircle } from "lucide-react"

const ScreenShare = ({ sessionId, localStream, remoteStream, isHost, onStartShare, onStopShare }) => {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
      setIsSharing(true)
      setError(null)
    } else {
      setIsSharing(false)
    }
  }, [localStream])

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
      setError(null)
    }
  }, [remoteStream])

  const handleStartShare = async () => {
    try {
      await onStartShare()
      setError(null)
    } catch (err) {
      console.error("Failed to start screen share:", err)
      setError("Failed to start screen sharing. Please check permissions.")
    }
  }

  const handleStopShare = () => {
    onStopShare()
    setIsSharing(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-primary-400" />
            <span className="font-medium">Screen Share</span>
          </div>

          {isHost && (
            <div className="flex items-center space-x-2">
              {isSharing ? (
                <button
                  onClick={handleStopShare}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Square className="h-4 w-4" />
                  <span>Stop Sharing</span>
                </button>
              ) : (
                <button
                  onClick={handleStartShare}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Sharing</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {isHost ? (
          // Host view - show local screen share
          <div className="h-full">
            {isSharing && localStream ? (
              <div className="h-full relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain bg-black"
                />
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Sharing your screen
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-900">
                <div className="text-center text-gray-400">
                  <Monitor className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Screen Share</p>
                  <p className="text-sm mb-4">Click "Start Sharing" to share your screen</p>
                  {error && (
                    <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-md">
                      <div className="flex items-center space-x-2 text-red-300">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Guest view - show remote screen share
          <div className="h-full">
            {remoteStream ? (
              <div className="h-full relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain bg-black"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Viewing shared screen
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-900">
                <div className="text-center text-gray-400">
                  <Monitor className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Waiting for Screen Share</p>
                  <p className="text-sm">The host hasn't started sharing their screen yet</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="text-sm text-gray-400">
          {isHost ? (
            <div>
              <p className="mb-2">
                <strong>Host Controls:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Click "Start Sharing" to share your entire screen</li>
                <li>You can choose which screen or application to share</li>
                <li>Click "Stop Sharing" to end the screen share</li>
              </ul>
            </div>
          ) : (
            <div>
              <p className="mb-2">
                <strong>Guest View:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>You can view the host's shared screen here</li>
                <li>Use the Remote Desktop tab to request control</li>
                <li>The host controls when screen sharing starts and stops</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScreenShare
