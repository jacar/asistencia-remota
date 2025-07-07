"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  MousePointer, 
  Keyboard, 
  Type, 
  Scroll, 
  Play, 
  Pause, 
  Square,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Home,
  Send,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { useRemoteControl } from "@/hooks/use-remote-control"

interface RemoteControlPanelProps {
  isEnabled: boolean
  onEnable: () => void
  onDisable: () => void
}

export const RemoteControlPanel: React.FC<RemoteControlPanelProps> = ({
  isEnabled,
  onEnable,
  onDisable,
}) => {
  const { 
    sendMouseMove, 
    sendMouseClick, 
    sendKeyPress, 
    sendScroll, 
    sendText 
  } = useRemoteControl()

  const [textInput, setTextInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const recordingRef = useRef<NodeJS.Timeout | null>(null)

  // Manejar clics del mouse
  const handleMouseClick = (button: "left" | "right" | "middle") => {
    sendMouseClick(button)
  }

  // Manejar teclas especiales
  const handleSpecialKey = (key: string) => {
    sendKeyPress(key)
  }

  // Manejar texto
  const handleSendText = () => {
    if (textInput.trim()) {
      sendText(textInput)
      setTextInput("")
    }
  }

  // Manejar scroll
  const handleScroll = (direction: "up" | "down" | "left" | "right") => {
    const scrollAmount = 100
    switch (direction) {
      case "up":
        sendScroll(0, -scrollAmount)
        break
      case "down":
        sendScroll(0, scrollAmount)
        break
      case "left":
        sendScroll(-scrollAmount, 0)
        break
      case "right":
        sendScroll(scrollAmount, 0)
        break
    }
  }

  // Iniciar grabación de macros
  const startRecording = () => {
    setIsRecording(true)
    // Aquí implementarías la lógica de grabación
  }

  // Detener grabación
  const stopRecording = () => {
    setIsRecording(false)
    if (recordingRef.current) {
      clearTimeout(recordingRef.current)
    }
  }

  if (!isEnabled) {
    return (
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MousePointer className="h-5 w-5" />
            <span>Control Remoto</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              El control remoto no está habilitado. Espera a que el cliente acepte tu solicitud.
            </p>
            <Button onClick={onEnable} className="bg-blue-600 hover:bg-blue-700">
              <MousePointer className="h-4 w-4 mr-2" />
              Solicitar Control
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MousePointer className="h-5 w-5" />
            <span>Control Remoto</span>
          </div>
          <Badge className="bg-green-600 text-white">
            <Play className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mouse Controls */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Mouse</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              size="sm" 
              onClick={() => handleMouseClick("left")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Clic Izquierdo
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleMouseClick("right")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Clic Derecho
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleMouseClick("middle")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Clic Medio
            </Button>
          </div>
        </div>

        {/* Keyboard Controls */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Teclado</h4>
          <div className="grid grid-cols-4 gap-2">
            <Button size="sm" onClick={() => handleSpecialKey("Enter")}>
              Enter
            </Button>
            <Button size="sm" onClick={() => handleSpecialKey("Tab")}>
              Tab
            </Button>
            <Button size="sm" onClick={() => handleSpecialKey("Escape")}>
              Esc
            </Button>
            <Button size="sm" onClick={() => handleSpecialKey("Backspace")}>
              ←
            </Button>
          </div>
          
          {/* Arrow Keys */}
          <div className="grid grid-cols-3 gap-2">
            <div></div>
            <Button size="sm" onClick={() => handleSpecialKey("ArrowUp")}>
              <ArrowUp className="h-3 w-3" />
            </Button>
            <div></div>
            <Button size="sm" onClick={() => handleSpecialKey("ArrowLeft")}>
              <ArrowLeft className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={() => handleSpecialKey("ArrowDown")}>
              <ArrowDown className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={() => handleSpecialKey("ArrowRight")}>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Navigation Keys */}
          <div className="grid grid-cols-4 gap-2">
            <Button size="sm" onClick={() => handleSpecialKey("Home")}>
              <Home className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={() => handleSpecialKey("PageUp")}>
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={() => handleSpecialKey("PageDown")}>
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={() => handleSpecialKey("End")}>
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Texto</h4>
          <div className="flex space-x-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Escribe texto para enviar..."
              onKeyPress={(e) => e.key === "Enter" && handleSendText()}
            />
            <Button onClick={handleSendText} size="sm">
              <Type className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scroll Controls */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Scroll</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" onClick={() => handleScroll("up")}>
              <ArrowUp className="h-3 w-3 mr-1" />
              Arriba
            </Button>
            <Button size="sm" onClick={() => handleScroll("down")}>
              <ArrowDown className="h-3 w-3 mr-1" />
              Abajo
            </Button>
            <Button size="sm" onClick={() => handleScroll("left")}>
              <ArrowLeft className="h-3 w-3 mr-1" />
              Izquierda
            </Button>
            <Button size="sm" onClick={() => handleScroll("right")}>
              <ArrowRight className="h-3 w-3 mr-1" />
              Derecha
            </Button>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Macros</h4>
          <div className="flex space-x-2">
            {!isRecording ? (
              <Button 
                size="sm" 
                onClick={startRecording}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-1" />
                Grabar Macro
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700"
              >
                <Square className="h-4 w-4 mr-1" />
                Detener
              </Button>
            )}
          </div>
        </div>

        {/* Disable Control */}
        <div className="pt-4 border-t">
          <Button 
            onClick={onDisable} 
            variant="destructive" 
            size="sm" 
            className="w-full"
          >
            <Pause className="h-4 w-4 mr-2" />
            Deshabilitar Control
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 