const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
]

const PC_CONFIG = {
  iceServers: ICE_SERVERS,
  iceCandidatePoolSize: 10,
}

class WebRTCService {
  constructor() {
    this.peerConnections = new Map()
  }

  // Create a new peer connection
  async createPeerConnection(sessionId = "default") {
    try {
      const pc = new RTCPeerConnection(PC_CONFIG)

      // Store the connection
      this.peerConnections.set(sessionId, pc)

      // Set up basic event handlers
      pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state: ${pc.iceConnectionState}`)
      }

      pc.onconnectionstatechange = () => {
        console.log(`Connection state: ${pc.connectionState}`)
      }

      pc.onsignalingstatechange = () => {
        console.log(`Signaling state: ${pc.signalingState}`)
      }

      return pc
    } catch (error) {
      console.error("Failed to create peer connection:", error)
      throw error
    }
  }

  // Get screen sharing stream
  async getScreenStream() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "monitor",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      return stream
    } catch (error) {
      console.error("Failed to get screen stream:", error)
      throw new Error("Screen sharing permission denied or not supported")
    }
  }

  // Get user media stream (camera/microphone)
  async getUserMediaStream(constraints = { video: true, audio: true }) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      return stream
    } catch (error) {
      console.error("Failed to get user media:", error)
      throw new Error("Camera/microphone permission denied or not available")
    }
  }

  // Create WebRTC offer
  async createOffer(peerConnection) {
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })

      await peerConnection.setLocalDescription(offer)
      return offer
    } catch (error) {
      console.error("Failed to create offer:", error)
      throw error
    }
  }

  // Create WebRTC answer
  async createAnswer(peerConnection) {
    try {
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      return answer
    } catch (error) {
      console.error("Failed to create answer:", error)
      throw error
    }
  }

  // Handle incoming offer
  async handleOffer(peerConnection, offer) {
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    } catch (error) {
      console.error("Failed to handle offer:", error)
      throw error
    }
  }

  // Handle incoming answer
  async handleAnswer(peerConnection, answer) {
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    } catch (error) {
      console.error("Failed to handle answer:", error)
      throw error
    }
  }

  // Add ICE candidate
  async addIceCandidate(peerConnection, candidate) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      console.error("Failed to add ICE candidate:", error)
      throw error
    }
  }

  // Create data channel
  createDataChannel(peerConnection, label, options = {}) {
    try {
      const dataChannel = peerConnection.createDataChannel(label, {
        ordered: true,
        maxRetransmits: 3,
        ...options,
      })

      return dataChannel
    } catch (error) {
      console.error("Failed to create data channel:", error)
      throw error
    }
  }

  // Add stream to peer connection
  addStream(peerConnection, stream) {
    try {
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream)
      })
    } catch (error) {
      console.error("Failed to add stream:", error)
      throw error
    }
  }

  // Remove stream from peer connection
  removeStream(peerConnection, stream) {
    try {
      const senders = peerConnection.getSenders()
      senders.forEach((sender) => {
        if (sender.track && stream.getTracks().includes(sender.track)) {
          peerConnection.removeTrack(sender)
        }
      })
    } catch (error) {
      console.error("Failed to remove stream:", error)
      throw error
    }
  }

  // Get connection stats
  async getConnectionStats(peerConnection) {
    try {
      const stats = await peerConnection.getStats()
      const result = {}

      stats.forEach((report) => {
        if (report.type === "inbound-rtp" && report.mediaType === "video") {
          result.inboundVideo = {
            bytesReceived: report.bytesReceived,
            packetsReceived: report.packetsReceived,
            packetsLost: report.packetsLost,
            framesDecoded: report.framesDecoded,
            frameWidth: report.frameWidth,
            frameHeight: report.frameHeight,
          }
        }

        if (report.type === "outbound-rtp" && report.mediaType === "video") {
          result.outboundVideo = {
            bytesSent: report.bytesSent,
            packetsSent: report.packetsSent,
            framesEncoded: report.framesEncoded,
            frameWidth: report.frameWidth,
            frameHeight: report.frameHeight,
          }
        }

        if (report.type === "candidate-pair" && report.state === "succeeded") {
          result.connection = {
            currentRoundTripTime: report.currentRoundTripTime,
            availableOutgoingBitrate: report.availableOutgoingBitrate,
            availableIncomingBitrate: report.availableIncomingBitrate,
          }
        }
      })

      return result
    } catch (error) {
      console.error("Failed to get connection stats:", error)
      throw error
    }
  }

  // Close peer connection
  closePeerConnection(sessionId = "default") {
    const pc = this.peerConnections.get(sessionId)
    if (pc) {
      pc.close()
      this.peerConnections.delete(sessionId)
    }
  }

  // Close all peer connections
  closeAllConnections() {
    this.peerConnections.forEach((pc, sessionId) => {
      pc.close()
    })
    this.peerConnections.clear()
  }

  // Get peer connection
  getPeerConnection(sessionId = "default") {
    return this.peerConnections.get(sessionId)
  }

  // Check WebRTC support
  static isSupported() {
    return !!(
      window.RTCPeerConnection &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      navigator.mediaDevices.getDisplayMedia
    )
  }

  // Get supported codecs
  static async getSupportedCodecs() {
    try {
      const pc = new RTCPeerConnection()
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })

      const codecs = {
        video: [],
        audio: [],
      }

      const lines = offer.sdp.split("\n")
      lines.forEach((line) => {
        if (line.startsWith("a=rtpmap:")) {
          const parts = line.split(" ")
          if (parts.length >= 2) {
            const codec = parts[1].toLowerCase()
            if (codec.includes("video") || codec.includes("h264") || codec.includes("vp8") || codec.includes("vp9")) {
              codecs.video.push(codec)
            } else if (codec.includes("audio") || codec.includes("opus") || codec.includes("pcmu")) {
              codecs.audio.push(codec)
            }
          }
        }
      })

      pc.close()
      return codecs
    } catch (error) {
      console.error("Failed to get supported codecs:", error)
      return { video: [], audio: [] }
    }
  }
}

export const webrtcService = new WebRTCService()
export default webrtcService
