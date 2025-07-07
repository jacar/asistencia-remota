import { useState, useEffect, useCallback, useRef } from 'react'
import { WebRTCAdvanced, WebRTCConfig, defaultWebRTCConfig } from '@/services/webrtc-advanced'

export interface WebRTCState {
  isInitialized: boolean
  isConnected: boolean
  isInitiator: boolean
  connectionState: string | undefined
  iceConnectionState: RTCIceConnectionState | undefined
  signalingState: RTCSignalingState | undefined
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  dataChannelOpen: boolean
  error: string | null
}

export interface WebRTCActions {
  initialize: (isInitiator: boolean) => Promise<void>
  getLocalStream: (constraints?: MediaStreamConstraints) => Promise<MediaStream>
  getScreenStream: () => Promise<MediaStream>
  addLocalStream: () => Promise<void>
  createOffer: () => Promise<RTCSessionDescriptionInit>
  createAnswer: () => Promise<RTCSessionDescriptionInit>
  setRemoteDescription: (description: RTCSessionDescriptionInit) => Promise<void>
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>
  sendMessage: (message: any) => void
  sendControlCommand: (command: {
    type: 'mouse' | 'keyboard' | 'scroll' | 'text' | 'macro'
    action: string
    data?: any
  }) => void
  getStats: () => Promise<RTCStatsReport>
  cleanup: () => void
}

export const useWebRTCAdvanced = (config?: Partial<WebRTCConfig>) => {
  const [state, setState] = useState<WebRTCState>({
    isInitialized: false,
    isConnected: false,
    isInitiator: false,
    connectionState: undefined,
    iceConnectionState: undefined,
    signalingState: undefined,
    localStream: null,
    remoteStream: null,
    dataChannelOpen: false,
    error: null
  })

  const webrtcRef = useRef<WebRTCAdvanced | null>(null)
  const mergedConfig = { ...defaultWebRTCConfig, ...config }

  // Inicializar WebRTC
  const initialize = useCallback(async (isInitiator: boolean) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      webrtcRef.current = new WebRTCAdvanced(mergedConfig)
      
      // Configurar event listeners
      webrtcRef.current.on('initialized', () => {
        setState(prev => ({ 
          ...prev, 
          isInitialized: true, 
          isInitiator 
        }))
      })

      webrtcRef.current.on('connection-state-change', ({ state }) => {
        setState(prev => ({ 
          ...prev, 
          connectionState: state,
          isConnected: state === 'connected'
        }))
      })

      webrtcRef.current.on('ice-connection-state-change', ({ state }) => {
        setState(prev => ({ ...prev, iceConnectionState: state }))
      })

      webrtcRef.current.on('signaling-state-change', ({ state }) => {
        setState(prev => ({ ...prev, signalingState: state }))
      })

      webrtcRef.current.on('local-stream', ({ stream }) => {
        setState(prev => ({ ...prev, localStream: stream }))
      })

      webrtcRef.current.on('stream-added', ({ stream }) => {
        setState(prev => ({ ...prev, remoteStream: stream }))
      })

      webrtcRef.current.on('data-channel-open', () => {
        setState(prev => ({ ...prev, dataChannelOpen: true }))
      })

      webrtcRef.current.on('data-channel-close', () => {
        setState(prev => ({ ...prev, dataChannelOpen: false }))
      })

      await webrtcRef.current.initialize(isInitiator)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setState(prev => ({ ...prev, error: errorMessage }))
      throw error
    }
  }, [mergedConfig])

  // Obtener stream local
  const getLocalStream = useCallback(async (constraints?: MediaStreamConstraints) => {
    if (!webrtcRef.current) {
      throw new Error('WebRTC no inicializado')
    }
    return await webrtcRef.current.getLocalStream(constraints)
  }, [])

  // Obtener stream de pantalla
  const getScreenStream = useCallback(async () => {
    if (!webrtcRef.current) {
      throw new Error('WebRTC no inicializado')
    }
    return await webrtcRef.current.getScreenStream()
  }, [])

  // Agregar stream local
  const addLocalStream = useCallback(async () => {
    if (!webrtcRef.current) {
      throw new Error('WebRTC no inicializado')
    }
    await webrtcRef.current.addLocalStream()
  }, [])

  // Crear oferta
  const createOffer = useCallback(async () => {
    if (!webrtcRef.current) {
      throw new Error('WebRTC no inicializado')
    }
    return await webrtcRef.current.createOffer()
  }, [])

  // Crear respuesta
  const createAnswer = useCallback(async () => {
    if (!webrtcRef.current) {
      throw new Error('WebRTC no inicializado')
    }
    return await webrtcRef.current.createAnswer()
  }, [])

  // Establecer descripción remota
  const setRemoteDescription = useCallback(async (description: RTCSessionDescriptionInit) => {
    if (!webrtcRef.current) {
      throw new Error('WebRTC no inicializado')
    }
    await webrtcRef.current.setRemoteDescription(description)
  }, [])

  // Agregar ICE candidate
  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!webrtcRef.current) {
      throw new Error('WebRTC no inicializado')
    }
    await webrtcRef.current.addIceCandidate(candidate)
  }, [])

  // Enviar mensaje
  const sendMessage = useCallback((message: any) => {
    if (!webrtcRef.current) {
      throw new Error('WebRTC no inicializado')
    }
    webrtcRef.current.sendMessage(message)
  }, [])

  // Enviar comando de control
  const sendControlCommand = useCallback((command: {
    type: 'mouse' | 'keyboard' | 'scroll' | 'text' | 'macro'
    action: string
    data?: any
  }) => {
    if (!webrtcRef.current) {
      throw new Error('WebRTC no inicializado')
    }
    webrtcRef.current.sendControlCommand(command)
  }, [])

  // Obtener estadísticas
  const getStats = useCallback(async () => {
    if (!webrtcRef.current) {
      throw new Error('WebRTC no inicializado')
    }
    return await webrtcRef.current.getStats()
  }, [])

  // Limpiar recursos
  const cleanup = useCallback(() => {
    if (webrtcRef.current) {
      webrtcRef.current.cleanup()
      webrtcRef.current = null
    }
    setState({
      isInitialized: false,
      isConnected: false,
      isInitiator: false,
      connectionState: undefined,
      iceConnectionState: undefined,
      signalingState: undefined,
      localStream: null,
      remoteStream: null,
      dataChannelOpen: false,
      error: null
    })
  }, [])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const actions: WebRTCActions = {
    initialize,
    getLocalStream,
    getScreenStream,
    addLocalStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    sendMessage,
    sendControlCommand,
    getStats,
    cleanup
  }

  return { state, actions }
} 