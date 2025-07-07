"use client"

import { useRef, useEffect, useState } from "react"
import { Monitor, AlertCircle } from "lucide-react"

const RemoteDesktop = ({ sessionId, remoteStream, isControlling, onRemoteInput, isFullscreen }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [videoError, setVideoError] = useState(null)

  useEffect(() => {
    if (remoteStream && videoRef.current) {
      videoRef.current.srcObject = remoteStream
      setVideoError(null)
    }
  }, [remoteStream])

  const handleVideoLoad = () => {
    setIsVideoReady(true)
  }

  const handleVideoError = (error) => {
    console.error("Video error:", error)
    setVideoError("Failed to load remote desktop stream")
    setIsVideoReady(false)
  }

  const handleMouseMove = (e) => {
    if (!isControlling || !onRemoteInput) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    onRemoteInput({
      type: "mousemove",
      x: x,
      y: y,
    })
  }

  const handleMouseClick = (e) => {
    if (!isControlling || !onRemoteInput) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    onRemoteInput({
      type: "mouseclick",
      button: e.button,
      x: x,
      y: y,
    })
  }

  const handleKeyDown = (e) => {
    if (!isControlling || !onRemoteInput) return

    // Prevent default browser shortcuts when controlling
    e.preventDefault()

    onRemoteInput({
      type: "keydown",
      key: e.key,
      keyCode: e.keyCode,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey,
      metaKey: e.metaKey,
    })
  }

  const handleKeyUp = (e) => {
    if (!isControlling || !onRemoteInput) return

    e.preventDefault()

    onRemoteInput({
      type: "keyup",
      key: e.key,
      keyCode: e.keyCode,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey,
      metaKey: e.metaKey,
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-primary-400" />
            <span className="font-medium">Remote Desktop</span>
          </div>

          {isControlling && (
            <div className="flex items-center space-x-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Controlling</span>
            </div>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black">
        {remoteStream ? (
          <div className="h-full relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-contain ${
                isControlling ? "remote-canvas controlling" : "remote-canvas"
              }`}
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseClick}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              tabIndex={isControlling ? 0 : -1}
            />

            {/* Control Overlay */}
            {isControlling && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                You are controlling this desktop
              </div>
            )}

            {/* Loading Overlay */}
            {!isVideoReady && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                <div className="text-center">
                  <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading remote desktop...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            {videoError ? (
              <div className="text-center text-gray-400">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Connection Error</p>
                <p className="text-sm">{videoError}</p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Monitor className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Waiting for Connection</p>
                <p className="text-sm">The remote desktop will appear here once connected</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      {!isFullscreen && (
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="text-sm text-gray-400">
            {isControlling ? (
              <p>
                <strong>You are controlling the remote desktop.</strong>
                Use your mouse and keyboard normally. Press Esc to release control.
              </p>
            ) : (
              <p>Click "Request Control" to interact with the remote desktop. The host must approve your request.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RemoteDesktop
