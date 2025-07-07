"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Wifi, 
  WifiOff, 
  MessageCircle, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Server,
  Users,
  Clock
} from "lucide-react"

interface DebugPanelProps {
  roomCode?: string
  isHost?: boolean
  socketConnected?: boolean
  socketConnecting?: boolean
  serverStatus?: string
  connectionStatus?: string
  remoteControlEnabled?: boolean
  onRefresh?: () => void
}

export function DebugPanel({
  roomCode,
  isHost,
  socketConnected,
  socketConnecting,
  serverStatus,
  connectionStatus,
  remoteControlEnabled,
  onRefresh
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="bg-gray-50/50 border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-gray-600" />
            <CardTitle className="text-sm">Debug Panel</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2"
            >
              {isExpanded ? "Ocultar" : "Mostrar"}
            </Button>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-6 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          {/* Estado del servidor */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Servidor:</span>
            <Badge
              variant={
                serverStatus === "online" ? "default" : 
                serverStatus === "vercel" ? "secondary" : 
                "destructive"
              }
              className="text-xs"
            >
              {serverStatus === "online" ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : serverStatus === "vercel" ? (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Vercel
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>

          {/* Estado de WebSocket */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">WebSocket:</span>
            <Badge
              variant={socketConnected ? "default" : socketConnecting ? "secondary" : "destructive"}
              className="text-xs"
            >
              {socketConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Conectado
                </>
              ) : socketConnecting ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Conectando
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Desconectado
                </>
              )}
            </Badge>
          </div>

          {/* Estado de conexión */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Conexión:</span>
            <Badge
              variant={
                connectionStatus === "connected" ? "default" : 
                connectionStatus === "connecting" ? "secondary" : 
                "destructive"
              }
              className="text-xs"
            >
              {connectionStatus === "connected" ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Conectado
                </>
              ) : connectionStatus === "connecting" ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Conectando
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Desconectado
                </>
              )}
            </Badge>
          </div>

          <Separator />

          {/* Información de la sala */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Sala:</span>
              <Badge variant="outline" className="text-xs font-mono">
                {roomCode || "Sin sala"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Rol:</span>
              <Badge variant="outline" className="text-xs">
                {isHost ? (
                  <>
                    <Users className="h-3 w-3 mr-1" />
                    Técnico
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Cliente
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Control:</span>
              <Badge
                variant={remoteControlEnabled ? "default" : "secondary"}
                className="text-xs"
              >
                {remoteControlEnabled ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Habilitado
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Deshabilitado
                  </>
                )}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Timestamp */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Última actualización:</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
} 