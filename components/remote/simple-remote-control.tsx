"use client"

import React, { useState } from "react"
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
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle
} from "lucide-react"

export const SimpleRemoteControl: React.FC = () => {
  const [textInput, setTextInput] = useState("")

  // Manejar clics del mouse
  const handleMouseClick = (button: "left" | "right" | "middle") => {
    console.log(`🎮 Mouse click: ${button}`)
    // Aquí se implementaría el envío real de comandos
  }

  // Manejar teclas especiales
  const handleSpecialKey = (key: string) => {
    console.log(`⌨️ Key press: ${key}`)
    // Aquí se implementaría el envío real de comandos
  }

  // Manejar texto
  const handleSendText = () => {
    if (textInput.trim()) {
      console.log(`📝 Sending text: ${textInput}`)
      setTextInput("")
      // Aquí se implementaría el envío real de comandos
    }
  }

  // Manejar scroll
  const handleScroll = (direction: "up" | "down" | "left" | "right") => {
    console.log(`📜 Scroll: ${direction}`)
    // Aquí se implementaría el envío real de comandos
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
            <CheckCircle className="h-3 w-3 mr-1" />
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
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Enviar Texto</h4>
          <div className="flex space-x-2">
            <Input
              placeholder="Escribe texto..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendText()}
            />
            <Button size="sm" onClick={handleSendText} disabled={!textInput.trim()}>
              <Send className="h-3 w-3" />
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

        {/* Status */}
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            <Play className="h-3 w-3 mr-1" />
            Control Remoto Activo
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
} 