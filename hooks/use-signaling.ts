import { useState, useEffect, useCallback, useRef } from 'react'
import { SignalingService, SignalingConfig, SignalingMessage, defaultSignalingConfig } from '@/services/signaling-service'

export interface SignalingState {
  isConnected: boolean
  readyState: number | null
  reconnectAttempts: number
  error: string | null
}

export interface SignalingActions {
  connect: (roomId: string, userId: string) => Promise<void>
  disconnect: () => void
  sendOffer: (offer: RTCSessionDescriptionInit, to?: string) => void
  sendAnswer: (answer: RTCSessionDescriptionInit, to?: string) => void
  sendIceCandidate: (candidate: RTCIceCandidateInit, to?: string) => void
  sendControlRequest: (request: {
    type: 'request' | 'accept' | 'reject'
    message?: string
  }, to?: string) => void
  sendControlResponse: (response: {
    accepted: boolean
    message?: string
  }, to?: string) => void
  sendControlCommand: (command: {
    type: 'mouse' | 'keyboard' | 'scroll' | 'text' | 'macro'
    action: string
    data?: any
  }, to?: string) => void
  getConnectionState: () => {
    isConnected: boolean
    readyState: number | null
    reconnectAttempts: number
  }
}

export const useSignaling = (config?: Partial<SignalingConfig>) => {
  const [state, setState] = useState<SignalingState>({
    isConnected: false,
    readyState: null,
    reconnectAttempts: 0,
    error: null
  })

  const signalingRef = useRef<SignalingService | null>(null)
  const mergedConfig = { ...defaultSignalingConfig, ...config }

  // Conectar al servidor de señalización
  const connect = useCallback(async (roomId: string, userId: string) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      signalingRef.current = new SignalingService(mergedConfig)
      
      // Configurar event listeners
      signalingRef.current.on('connected', () => {
        setState(prev => ({ 
          ...prev, 
          isConnected: true,
          reconnectAttempts: 0
        }))
      })

      signalingRef.current.on('disconnected', ({ code, reason }) => {
        setState(prev => ({ 
          ...prev, 
          isConnected: false,
          readyState: null
        }))
        console.log('🔌 Desconectado:', code, reason)
      })

      signalingRef.current.on('reconnect-failed', () => {
        setState(prev => ({ 
          ...prev, 
          error: 'Máximo de intentos de reconexión alcanzado'
        }))
      })

      signalingRef.current.on('error', (error) => {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        setState(prev => ({ ...prev, error: errorMessage }))
      })

      signalingRef.current.on('message', (message: SignalingMessage) => {
        // Emitir evento para que otros componentes puedan escuchar
        window.dispatchEvent(new CustomEvent('signaling-message', { detail: message }))
      })

      await signalingRef.current.connect(roomId, userId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setState(prev => ({ ...prev, error: errorMessage }))
      throw error
    }
  }, [mergedConfig])

  // Desconectar
  const disconnect = useCallback(() => {
    if (signalingRef.current) {
      signalingRef.current.disconnect()
    }
  }, [])

  // Enviar oferta
  const sendOffer = useCallback((offer: RTCSessionDescriptionInit, to?: string) => {
    if (!signalingRef.current) {
      throw new Error('Servicio de señalización no inicializado')
    }
    signalingRef.current.sendOffer(offer, to)
  }, [])

  // Enviar respuesta
  const sendAnswer = useCallback((answer: RTCSessionDescriptionInit, to?: string) => {
    if (!signalingRef.current) {
      throw new Error('Servicio de señalización no inicializado')
    }
    signalingRef.current.sendAnswer(answer, to)
  }, [])

  // Enviar ICE candidate
  const sendIceCandidate = useCallback((candidate: RTCIceCandidateInit, to?: string) => {
    if (!signalingRef.current) {
      throw new Error('Servicio de señalización no inicializado')
    }
    signalingRef.current.sendIceCandidate(candidate, to)
  }, [])

  // Enviar solicitud de control
  const sendControlRequest = useCallback((request: {
    type: 'request' | 'accept' | 'reject'
    message?: string
  }, to?: string) => {
    if (!signalingRef.current) {
      throw new Error('Servicio de señalización no inicializado')
    }
    signalingRef.current.sendControlRequest(request, to)
  }, [])

  // Enviar respuesta de control
  const sendControlResponse = useCallback((response: {
    accepted: boolean
    message?: string
  }, to?: string) => {
    if (!signalingRef.current) {
      throw new Error('Servicio de señalización no inicializado')
    }
    signalingRef.current.sendControlResponse(response, to)
  }, [])

  // Enviar comando de control
  const sendControlCommand = useCallback((command: {
    type: 'mouse' | 'keyboard' | 'scroll' | 'text' | 'macro'
    action: string
    data?: any
  }, to?: string) => {
    if (!signalingRef.current) {
      throw new Error('Servicio de señalización no inicializado')
    }
    signalingRef.current.sendControlCommand(command, to)
  }, [])

  // Obtener estado de conexión
  const getConnectionState = useCallback(() => {
    if (!signalingRef.current) {
      return {
        isConnected: false,
        readyState: null,
        reconnectAttempts: 0
      }
    }
    return signalingRef.current.getConnectionState()
  }, [])

  // Actualizar estado de conexión
  useEffect(() => {
    const updateConnectionState = () => {
      const connectionState = getConnectionState()
      setState(prev => ({
        ...prev,
        isConnected: connectionState.isConnected,
        readyState: connectionState.readyState,
        reconnectAttempts: connectionState.reconnectAttempts
      }))
    }

    // Actualizar estado inicial
    updateConnectionState()

    // Actualizar estado cada segundo
    const interval = setInterval(updateConnectionState, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [getConnectionState])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (signalingRef.current) {
        signalingRef.current.cleanup()
      }
    }
  }, [])

  const actions: SignalingActions = {
    connect,
    disconnect,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendControlRequest,
    sendControlResponse,
    sendControlCommand,
    getConnectionState
  }

  return { state, actions }
}

// Hook para escuchar mensajes de señalización
export const useSignalingMessages = (callback: (message: SignalingMessage) => void) => {
  useEffect(() => {
    const handleMessage = (event: CustomEvent<SignalingMessage>) => {
      callback(event.detail)
    }

    window.addEventListener('signaling-message', handleMessage as EventListener)

    return () => {
      window.removeEventListener('signaling-message', handleMessage as EventListener)
    }
  }, [callback])
} 