import { EventEmitter } from 'events'

export interface WebRTCConfig {
  iceServers: RTCIceServer[]
  mediaConstraints: MediaStreamConstraints
  dataChannelConfig?: RTCDataChannelInit
}

export interface WebRTCEvent {
  type: 'connection-state-change' | 'ice-connection-state-change' | 'ice-gathering-state-change' | 'signaling-state-change' | 'data-channel-open' | 'data-channel-message' | 'data-channel-close' | 'stream-added' | 'stream-removed' | 'ice-candidate' | 'offer' | 'answer'
  data?: any
}

export class WebRTCAdvanced extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private dataChannel: RTCDataChannel | null = null
  private config: WebRTCConfig
  private isInitiator: boolean = false

  constructor(config: WebRTCConfig) {
    super()
    this.config = config
  }

  /**
   * Inicializar la conexión WebRTC
   */
  async initialize(isInitiator: boolean = false): Promise<void> {
    try {
      this.isInitiator = isInitiator
      
      // Crear RTCPeerConnection con configuración ICE
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceTransportPolicy: 'all'
      })

      // Configurar event listeners
      this.setupEventListeners()

      console.log('✅ WebRTC Advanced inicializado')
      this.emit('initialized', { isInitiator })
    } catch (error) {
      console.error('❌ Error inicializando WebRTC:', error)
      throw error
    }
  }

  /**
   * Configurar event listeners para el peer connection
   */
  private setupEventListeners(): void {
    if (!this.peerConnection) return

    // Connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', this.peerConnection?.connectionState)
      this.emit('connection-state-change', {
        state: this.peerConnection?.connectionState
      })
    }

    // ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection?.iceConnectionState)
      this.emit('ice-connection-state-change', {
        state: this.peerConnection?.iceConnectionState
      })
    }

    // ICE gathering state changes
    this.peerConnection.onicegatheringstatechange = () => {
      console.log('❄️ ICE gathering state:', this.peerConnection?.iceGatheringState)
      this.emit('ice-gathering-state-change', {
        state: this.peerConnection?.iceGatheringState
      })
    }

    // Signaling state changes
    this.peerConnection.onsignalingstatechange = () => {
      console.log('📡 Signaling state:', this.peerConnection?.signalingState)
      this.emit('signaling-state-change', {
        state: this.peerConnection?.signalingState
      })
    }

    // ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 ICE candidate:', event.candidate)
        this.emit('ice-candidate', {
          candidate: event.candidate
        })
      }
    }

    // Remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📹 Remote stream received')
      this.remoteStream = event.streams[0]
      this.emit('stream-added', {
        stream: this.remoteStream
      })
    }

    // Data channel (solo para el iniciador)
    if (this.isInitiator) {
      this.setupDataChannel()
    } else {
      this.peerConnection.ondatachannel = (event) => {
        console.log('📨 Data channel received')
        this.setupDataChannelHandler(event.channel)
      }
    }
  }

  /**
   * Configurar data channel para control remoto
   */
  private setupDataChannel(): void {
    if (!this.peerConnection) return

    try {
      this.dataChannel = this.peerConnection.createDataChannel('remote-control', {
        ordered: true,
        maxRetransmits: 3
      })

      this.setupDataChannelHandler(this.dataChannel)
    } catch (error) {
      console.error('❌ Error creando data channel:', error)
    }
  }

  /**
   * Configurar handlers para data channel
   */
  private setupDataChannelHandler(channel: RTCDataChannel): void {
    this.dataChannel = channel

    channel.onopen = () => {
      console.log('✅ Data channel abierto')
      this.emit('data-channel-open', { channel })
    }

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 Data channel message:', data)
        this.emit('data-channel-message', { data })
      } catch (error) {
        console.error('❌ Error parsing data channel message:', error)
      }
    }

    channel.onclose = () => {
      console.log('❌ Data channel cerrado')
      this.emit('data-channel-close', { channel })
    }

    channel.onerror = (error) => {
      console.error('❌ Data channel error:', error)
    }
  }

  /**
   * Obtener stream local (cámara/pantalla)
   */
  async getLocalStream(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    try {
      const streamConstraints = constraints || this.config.mediaConstraints
      this.localStream = await navigator.mediaDevices.getUserMedia(streamConstraints)
      
      console.log('📹 Local stream obtenido')
      this.emit('local-stream', { stream: this.localStream })
      
      return this.localStream
    } catch (error) {
      console.error('❌ Error obteniendo stream local:', error)
      throw error
    }
  }

  /**
   * Obtener stream de pantalla
   */
  async getScreenStream(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      console.log('🖥️ Screen stream obtenido')
      this.emit('screen-stream', { stream: this.localStream })
      
      return this.localStream
    } catch (error) {
      console.error('❌ Error obteniendo screen stream:', error)
      throw error
    }
  }

  /**
   * Agregar stream local al peer connection
   */
  async addLocalStream(): Promise<void> {
    if (!this.peerConnection || !this.localStream) {
      throw new Error('Peer connection o local stream no disponible')
    }

    try {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!)
      })

      console.log('✅ Local stream agregado al peer connection')
    } catch (error) {
      console.error('❌ Error agregando local stream:', error)
      throw error
    }
  }

  /**
   * Crear oferta (para el iniciador)
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection no inicializado')
    }

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })

      await this.peerConnection.setLocalDescription(offer)
      console.log('📤 Offer creada')
      
      this.emit('offer', { offer })
      return offer
    } catch (error) {
      console.error('❌ Error creando offer:', error)
      throw error
    }
  }

  /**
   * Crear respuesta (para el receptor)
   */
  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection no inicializado')
    }

    try {
      const answer = await this.peerConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })

      await this.peerConnection.setLocalDescription(answer)
      console.log('📤 Answer creada')
      
      this.emit('answer', { answer })
      return answer
    } catch (error) {
      console.error('❌ Error creando answer:', error)
      throw error
    }
  }

  /**
   * Establecer descripción remota
   */
  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection no inicializado')
    }

    try {
      await this.peerConnection.setRemoteDescription(description)
      console.log('✅ Remote description establecida')
    } catch (error) {
      console.error('❌ Error estableciendo remote description:', error)
      throw error
    }
  }

  /**
   * Agregar ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection no inicializado')
    }

    try {
      await this.peerConnection.addIceCandidate(candidate)
      console.log('✅ ICE candidate agregada')
    } catch (error) {
      console.error('❌ Error agregando ICE candidate:', error)
      throw error
    }
  }

  /**
   * Enviar mensaje por data channel
   */
  sendMessage(message: any): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('⚠️ Data channel no disponible')
      return
    }

    try {
      const data = JSON.stringify(message)
      this.dataChannel.send(data)
      console.log('📤 Mensaje enviado:', message)
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error)
    }
  }

  /**
   * Enviar comando de control remoto
   */
  sendControlCommand(command: {
    type: 'mouse' | 'keyboard' | 'scroll' | 'text' | 'macro'
    action: string
    data?: any
  }): void {
    this.sendMessage({
      type: 'control',
      command,
      timestamp: Date.now()
    })
  }

  /**
   * Obtener estadísticas de la conexión
   */
  async getStats(): Promise<RTCStatsReport> {
    if (!this.peerConnection) {
      throw new Error('Peer connection no inicializado')
    }

    try {
      return await this.peerConnection.getStats()
    } catch (error) {
      console.error('❌ Error obteniendo stats:', error)
      throw error
    }
  }

  /**
   * Obtener información de la conexión
   */
  getConnectionInfo(): {
    connectionState: RTCConnectionState | undefined
    iceConnectionState: RTCIceConnectionState | undefined
    signalingState: RTCSignalingState | undefined
    isInitiator: boolean
  } {
    return {
      connectionState: this.peerConnection?.connectionState,
      iceConnectionState: this.peerConnection?.iceConnectionState,
      signalingState: this.peerConnection?.signalingState,
      isInitiator: this.isInitiator
    }
  }

  /**
   * Limpiar recursos
   */
  cleanup(): void {
    console.log('🧹 Limpiando WebRTC resources')

    // Detener streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop())
      this.remoteStream = null
    }

    // Cerrar data channel
    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }

    // Cerrar peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Remover event listeners
    this.removeAllListeners()

    console.log('✅ WebRTC cleanup completado')
  }
}

// Configuración por defecto
export const defaultWebRTCConfig: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  mediaConstraints: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100
    },
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    }
  },
  dataChannelConfig: {
    ordered: true,
    maxRetransmits: 3
  }
} 