import { EventEmitter } from 'events'

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'control-request' | 'control-response' | 'control-command'
  roomId: string
  from: string
  to?: string
  data: any
  timestamp: number
}

export interface SignalingConfig {
  serverUrl: string
  reconnectInterval: number
  maxReconnectAttempts: number
}

export class SignalingService extends EventEmitter {
  private socket: WebSocket | null = null
  private config: SignalingConfig
  private reconnectAttempts: number = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private isConnected: boolean = false
  private roomId: string | null = null
  private userId: string | null = null

  constructor(config: SignalingConfig) {
    super()
    this.config = config
  }

  /**
   * Conectar al servidor de señalización
   */
  connect(roomId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.roomId = roomId
        this.userId = userId

        const wsUrl = `${this.config.serverUrl}?roomId=${roomId}&userId=${userId}`
        this.socket = new WebSocket(wsUrl)

        this.socket.onopen = () => {
          console.log('✅ Conectado al servidor de señalización')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.emit('connected')
          resolve()
        }

        this.socket.onmessage = (event) => {
          try {
            const message: SignalingMessage = JSON.parse(event.data)
            console.log('📨 Mensaje recibido:', message)
            this.emit('message', message)
          } catch (error) {
            console.error('❌ Error parsing mensaje:', error)
          }
        }

        this.socket.onclose = (event) => {
          console.log('❌ Conexión cerrada:', event.code, event.reason)
          this.isConnected = false
          this.emit('disconnected', { code: event.code, reason: event.reason })
          
          // Intentar reconectar si no fue un cierre intencional
          if (event.code !== 1000) {
            this.scheduleReconnect()
          }
        }

        this.socket.onerror = (error) => {
          console.error('❌ Error de WebSocket:', error)
          this.emit('error', error)
          reject(error)
        }

      } catch (error) {
        console.error('❌ Error conectando:', error)
        reject(error)
      }
    })
  }

  /**
   * Programar reconexión
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('❌ Máximo de intentos de reconexión alcanzado')
      this.emit('reconnect-failed')
      return
    }

    this.reconnectAttempts++
    const delay = this.config.reconnectInterval * this.reconnectAttempts

    console.log(`🔄 Programando reconexión en ${delay}ms (intento ${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      if (this.roomId && this.userId) {
        this.connect(this.roomId, this.userId).catch(error => {
          console.error('❌ Error en reconexión:', error)
        })
      }
    }, delay)
  }

  /**
   * Enviar mensaje
   */
  sendMessage(message: Omit<SignalingMessage, 'timestamp'>): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ Socket no disponible para enviar mensaje')
      return
    }

    try {
      const fullMessage: SignalingMessage = {
        ...message,
        timestamp: Date.now()
      }

      this.socket.send(JSON.stringify(fullMessage))
      console.log('📤 Mensaje enviado:', fullMessage)
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error)
      this.emit('send-error', error)
    }
  }

  /**
   * Enviar oferta WebRTC
   */
  sendOffer(offer: RTCSessionDescriptionInit, to?: string): void {
    this.sendMessage({
      type: 'offer',
      roomId: this.roomId!,
      from: this.userId!,
      to,
      data: { offer }
    })
  }

  /**
   * Enviar respuesta WebRTC
   */
  sendAnswer(answer: RTCSessionDescriptionInit, to?: string): void {
    this.sendMessage({
      type: 'answer',
      roomId: this.roomId!,
      from: this.userId!,
      to,
      data: { answer }
    })
  }

  /**
   * Enviar ICE candidate
   */
  sendIceCandidate(candidate: RTCIceCandidateInit, to?: string): void {
    this.sendMessage({
      type: 'ice-candidate',
      roomId: this.roomId!,
      from: this.userId!,
      to,
      data: { candidate }
    })
  }

  /**
   * Enviar solicitud de control
   */
  sendControlRequest(request: {
    type: 'request' | 'accept' | 'reject'
    message?: string
  }, to?: string): void {
    this.sendMessage({
      type: 'control-request',
      roomId: this.roomId!,
      from: this.userId!,
      to,
      data: request
    })
  }

  /**
   * Enviar respuesta de control
   */
  sendControlResponse(response: {
    accepted: boolean
    message?: string
  }, to?: string): void {
    this.sendMessage({
      type: 'control-response',
      roomId: this.roomId!,
      from: this.userId!,
      to,
      data: response
    })
  }

  /**
   * Enviar comando de control
   */
  sendControlCommand(command: {
    type: 'mouse' | 'keyboard' | 'scroll' | 'text' | 'macro'
    action: string
    data?: any
  }, to?: string): void {
    this.sendMessage({
      type: 'control-command',
      roomId: this.roomId!,
      from: this.userId!,
      to,
      data: command
    })
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionState(): {
    isConnected: boolean
    readyState: number | null
    reconnectAttempts: number
  } {
    return {
      isConnected: this.isConnected,
      readyState: this.socket?.readyState || null,
      reconnectAttempts: this.reconnectAttempts
    }
  }

  /**
   * Desconectar
   */
  disconnect(): void {
    console.log('🔌 Desconectando del servidor de señalización')

    // Limpiar timer de reconexión
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // Cerrar socket
    if (this.socket) {
      this.socket.close(1000, 'Desconexión intencional')
      this.socket = null
    }

    this.isConnected = false
    this.roomId = null
    this.userId = null
    this.reconnectAttempts = 0

    this.emit('disconnected', { code: 1000, reason: 'Desconexión intencional' })
  }

  /**
   * Limpiar recursos
   */
  cleanup(): void {
    this.disconnect()
    this.removeAllListeners()
  }
}

// Configuración por defecto
export const defaultSignalingConfig: SignalingConfig = {
  serverUrl: 'ws://localhost:3004/socket',
  reconnectInterval: 1000,
  maxReconnectAttempts: 5
} 