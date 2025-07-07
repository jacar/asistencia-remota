"use client"

import React, { useState, useEffect } from "react"
import { X, Check, XCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface NotificationProps {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  duration?: number
  onAccept?: () => void
  onReject?: () => void
  onClose?: () => void
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 10000,
  onAccept,
  onReject,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-96 max-w-sm bg-white border rounded-lg shadow-lg transition-all duration-300",
        getBgColor(),
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
            
            {(onAccept || onReject) && (
              <div className="flex space-x-2 mt-3">
                {onAccept && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onAccept()
                      setIsVisible(false)
                      setTimeout(() => onClose?.(), 300)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Aceptar
                  </Button>
                )}
                {onReject && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onReject()
                      setIsVisible(false)
                      setTimeout(() => onClose?.(), 300)
                    }}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Rechazar
                  </Button>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose?.(), 300)
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Notification 