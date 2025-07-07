"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock } from "lucide-react"

const StatusIndicator = ({ url, label, type = "http" }) => {
  const [status, setStatus] = useState("checking")
  const [lastCheck, setLastCheck] = useState(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (type === "http") {
          const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
          })
          setStatus(response.ok ? "online" : "offline")
        } else if (type === "websocket") {
          // WebSocket check
          const ws = new WebSocket(url)
          ws.onopen = () => {
            setStatus("online")
            ws.close()
          }
          ws.onerror = () => setStatus("offline")
          ws.onclose = () => {
            if (status === "checking") setStatus("offline")
          }
        }
        setLastCheck(new Date())
      } catch (error) {
        setStatus("offline")
        setLastCheck(new Date())
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [url, type])

  const getIcon = () => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "offline":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "online":
        return "Online"
      case "offline":
        return "Offline"
      default:
        return "Checking..."
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{url}</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-medium ${
            status === "online" ? "text-green-600" : status === "offline" ? "text-red-600" : "text-yellow-600"
          }`}
        >
          {getStatusText()}
        </p>
        {lastCheck && <p className="text-xs text-gray-400">{lastCheck.toLocaleTimeString()}</p>}
      </div>
    </div>
  )
}

export default StatusIndicator
