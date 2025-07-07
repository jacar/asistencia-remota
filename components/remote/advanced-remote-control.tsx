"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Monitor, 
  Mouse, 
  Keyboard, 
  Scroll, 
  Type, 
  Play, 
  Square,
  Wifi,
  WifiOff,
  Settings,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from "lucide-react"
import { useWebRTCAdvanced } from "@/hooks/use-webrtc-advanced"

interface AdvancedRemoteControlProps {
  roomId: string
  isHost: boolean
  onConnectionChange?: (connected: boolean) => void
}

export function AdvancedRemoteControl({ 
  roomId, 
  isHost, 
  onConnectionChange 
}: AdvancedRemoteControlProps) {
  const { state, actions } = useWebRTCAdvanced()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStats, setConnectionStats] = useState<any>(null)
  const [controlEnabled, setControlEnabled] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Efectos para manejar streams de video
  useEffect(() => {
    if (state.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = state.localStream
    }
  }, [state.localStream])

  useEffect(() => {
    if (state.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = state.remoteStream
    }
  }, [state.remoteStream])

  // Efecto para notificar cambios de conexión
  useEffect(() => {
    onConnectionChange?.(state.isConnected)
  }, [state.isConnected, onConnectionChange])

  // Efecto para obtener estadísticas de conexión
  useEffect(() => {
    if (state.isConnected) {
      statsIntervalRef.current = setInterval(async () => {
        try {
          const stats = await actions.getStats()
          setConnectionStats(stats)
        } catch (error) {
          console.error('Error obteniendo stats:', error)
        }
      }, 2000)
    } else {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
        statsIntervalRef.current = null
      }
      setConnectionStats(null)
    }

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
      }
    }
  }, [state.isConnected, actions])

  // Inicializar conexión WebRTC
  const initializeConnection = async () => {
    try {
      setIsConnecting(true)
      await actions.initialize(isHost)
      
      if (isHost) {
        // El host obtiene stream de pantalla
        await actions.getScreenStream()
      } else {
        // El cliente obtiene stream de cámara
        await actions.getLocalStream()
      }
      
      await actions.addLocalStream()
      
      if (isHost) {
        const offer = await actions.createOffer()
        // Aquí enviarías la oferta al servidor de señalización
        console.log('Offer creada:', offer)
      }
      
    } catch (error) {
      console.error('Error inicializando conexión:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Manejar comandos de control
  const handleMouseClick = (x: number, y: number, button: 'left' | 'right' = 'left') => {
    if (!controlEnabled) return
    
    actions.sendControlCommand({
      type: 'mouse',
      action: 'click',
      data: { x, y, button }
    })
  }

  const handleKeyPress = (key: string) => {
    if (!controlEnabled) return
    
    actions.sendControlCommand({
      type: 'keyboard',
      action: 'press',
      data: { key }
    })
  }

  const handleScroll = (deltaX: number, deltaY: number) => {
    if (!controlEnabled) return
    
    actions.sendControlCommand({
      type: 'scroll',
      action: 'scroll',
      data: { deltaX, deltaY }
    })
  }

  const handleTextInput = (text: string) => {
    if (!controlEnabled) return
    
    actions.sendControlCommand({
      type: 'text',
      action: 'input',
      data: { text }
    })
  }

  const handleMacro = (macroName: string) => {
    if (!controlEnabled) return
    
    actions.sendControlCommand({
      type: 'macro',
      action: 'execute',
      data: { macro: macroName }
    })
  }

  // Toggle controles
  const toggleScreenSharing = async () => {
    try {
      if (screenSharing) {
        // Detener screen sharing
        setScreenSharing(false)
        await actions.getLocalStream()
      } else {
        // Iniciar screen sharing
        setScreenSharing(true)
        await actions.getScreenStream()
      }
      await actions.addLocalStream()
    } catch (error) {
      console.error('Error toggle screen sharing:', error)
    }
  }

  const toggleAudio = () => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
      }
    }
  }

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      actions.cleanup()
    }
  }, [actions])

  const getConnectionStatusColor = () => {
    if (state.isConnected) return "bg-green-500"
    if (state.isInitialized) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getConnectionStatusText = () => {
    if (state.isConnected) return "Conectado"
    if (state.isInitialized) return "Inicializando"
    return "Desconectado"
  }

  return (
    <div className="space-y-6">
      {/* Estado de Conexión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`} />
            Control Remoto Avanzado
            <Badge variant={isHost ? "default" : "secondary"}>
              {isHost ? "Host" : "Cliente"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {getConnectionStatusText()} - Room: {roomId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botones de Control */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={initializeConnection}
              disabled={isConnecting || state.isInitialized}
              className="flex items-center gap-2"
            >
              {isConnecting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  {state.isInitialized ? "Reconectar" : "Iniciar Conexión"}
                </>
              )}
            </Button>

            <Button
              onClick={() => setControlEnabled(!controlEnabled)}
              disabled={!state.isConnected}
              variant={controlEnabled ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {controlEnabled ? "Deshabilitar Control" : "Habilitar Control"}
            </Button>

            {isHost && (
              <Button
                onClick={toggleScreenSharing}
                disabled={!state.isInitialized}
                variant="outline"
                className="flex items-center gap-2"
              >
                {screenSharing ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                {screenSharing ? "Detener Pantalla" : "Compartir Pantalla"}
              </Button>
            )}
          </div>

          {/* Controles de Media */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={toggleAudio}
              disabled={!state.isInitialized}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              Audio
            </Button>

            <Button
              onClick={toggleVideo}
              disabled={!state.isInitialized}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              Video
            </Button>
          </div>

          {/* Estadísticas de Conexión */}
          {connectionStats && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Estadísticas de Conexión</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Estado ICE:</span>
                  <Badge variant="outline" className="ml-2">
                    {state.iceConnectionState}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Señalización:</span>
                  <Badge variant="outline" className="ml-2">
                    {state.signalingState}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Video Local */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Video Local</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-48 object-cover rounded-md bg-black"
            />
          </CardContent>
        </Card>

        {/* Video Remoto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Video Remoto</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-48 object-cover rounded-md bg-black"
            />
          </CardContent>
        </Card>
      </div>

      {/* Panel de Control */}
      {controlEnabled && state.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mouse className="w-4 h-4" />
              Panel de Control
            </CardTitle>
            <CardDescription>
              Controles disponibles para el dispositivo remoto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controles de Mouse */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Mouse</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleMouseClick(100, 100, 'left')}
                  size="sm"
                  variant="outline"
                >
                  Click Izquierdo
                </Button>
                <Button
                  onClick={() => handleMouseClick(100, 100, 'right')}
                  size="sm"
                  variant="outline"
                >
                  Click Derecho
                </Button>
                <Button
                  onClick={() => handleMouseClick(200, 200, 'left')}
                  size="sm"
                  variant="outline"
                >
                  Doble Click
                </Button>
              </div>
            </div>

            <Separator />

            {/* Controles de Teclado */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Teclado</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleKeyPress('Enter')}
                  size="sm"
                  variant="outline"
                >
                  Enter
                </Button>
                <Button
                  onClick={() => handleKeyPress('Escape')}
                  size="sm"
                  variant="outline"
                >
                  Escape
                </Button>
                <Button
                  onClick={() => handleKeyPress('Tab')}
                  size="sm"
                  variant="outline"
                >
                  Tab
                </Button>
                <Button
                  onClick={() => handleKeyPress('Ctrl+A')}
                  size="sm"
                  variant="outline"
                >
                  Ctrl+A
                </Button>
              </div>
            </div>

            <Separator />

            {/* Controles de Scroll */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Scroll</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleScroll(0, -100)}
                  size="sm"
                  variant="outline"
                >
                  Scroll Up
                </Button>
                <Button
                  onClick={() => handleScroll(0, 100)}
                  size="sm"
                  variant="outline"
                >
                  Scroll Down
                </Button>
                <Button
                  onClick={() => handleScroll(-100, 0)}
                  size="sm"
                  variant="outline"
                >
                  Scroll Left
                </Button>
                <Button
                  onClick={() => handleScroll(100, 0)}
                  size="sm"
                  variant="outline"
                >
                  Scroll Right
                </Button>
              </div>
            </div>

            <Separator />

            {/* Macros */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Macros</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleMacro('copy')}
                  size="sm"
                  variant="outline"
                >
                  Copiar
                </Button>
                <Button
                  onClick={() => handleMacro('paste')}
                  size="sm"
                  variant="outline"
                >
                  Pegar
                </Button>
                <Button
                  onClick={() => handleMacro('select_all')}
                  size="sm"
                  variant="outline"
                >
                  Seleccionar Todo
                </Button>
                <Button
                  onClick={() => handleMacro('undo')}
                  size="sm"
                  variant="outline"
                >
                  Deshacer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error:</span>
              <span className="text-sm">{state.error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 