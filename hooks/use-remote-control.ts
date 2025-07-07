import { useState, useCallback, useRef } from "react"

interface RemoteControlState {
  isEnabled: boolean
  isConnected: boolean
  canControl: boolean
}

export const useRemoteControl = () => {
  const [state, setState] = useState<RemoteControlState>({
    isEnabled: false,
    isConnected: false,
    canControl: false,
  })

  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const dataChannel = useRef<RTCDataChannel | null>(null)

  // Habilitar control remoto
  const enableRemoteControl = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEnabled: true,
      canControl: true,
    }))
  }, [])

  // Deshabilitar control remoto
  const disableRemoteControl = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEnabled: false,
      canControl: false,
    }))
  }, [])

  // Enviar comando de control
  const sendControlCommand = useCallback((command: string, data?: any) => {
    if (!state.canControl || !dataChannel.current) {
      console.warn("Control remoto no disponible")
      return false
    }

    try {
      const message = {
        type: "control",
        command,
        data,
        timestamp: Date.now(),
      }
      
      dataChannel.current.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error("Error enviando comando de control:", error)
      return false
    }
  }, [state.canControl])

  // Comandos específicos
  const sendMouseMove = useCallback((x: number, y: number) => {
    return sendControlCommand("mouseMove", { x, y })
  }, [sendControlCommand])

  const sendMouseClick = useCallback((button: "left" | "right" | "middle" = "left") => {
    return sendControlCommand("mouseClick", { button })
  }, [sendControlCommand])

  const sendKeyPress = useCallback((key: string, modifiers?: string[]) => {
    return sendControlCommand("keyPress", { key, modifiers })
  }, [sendControlCommand])

  const sendScroll = useCallback((deltaX: number, deltaY: number) => {
    return sendControlCommand("scroll", { deltaX, deltaY })
  }, [sendControlCommand])

  const sendText = useCallback((text: string) => {
    return sendControlCommand("text", { text })
  }, [sendControlCommand])

  return {
    state,
    enableRemoteControl,
    disableRemoteControl,
    sendControlCommand,
    sendMouseMove,
    sendMouseClick,
    sendKeyPress,
    sendScroll,
    sendText,
  }
} 