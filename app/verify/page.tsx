"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Monitor,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  MessageCircle,
  Phone,
  Smartphone,
  Camera,
  Mic,
  Share,
  Home,
  Settings,
  Info,
  AlertTriangle,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface TestResult {
  name: string
  status: "success" | "error" | "warning" | "pending"
  message: string
  details?: string
  timestamp?: Date
}

interface SystemInfo {
  userAgent: string
  platform: string
  language: string
  cookiesEnabled: boolean
  onlineStatus: boolean
  screenResolution: string
  viewport: string
  timezone: string
  connection?: string
}

export default function VerifyPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline" | "vercel">("checking")
  const [webrtcSupport, setWebrtcSupport] = useState<boolean | null>(null)
  const [mediaSupport, setMediaSupport] = useState<{
    camera: boolean
    microphone: boolean
    screenShare: boolean
  } | null>(null)

  // Obtener información del sistema
  const getSystemInfo = (): SystemInfo => {
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      connection: connection ? connection.effectiveType : "unknown",
    }
  }

  // Verificar soporte WebRTC
  const checkWebRTCSupport = async (): Promise<TestResult> => {
    try {
      const hasRTCPeerConnection = !!(
        window.RTCPeerConnection ||
        (window as any).webkitRTCPeerConnection ||
        (window as any).mozRTCPeerConnection
      )

      const hasGetUserMedia = !!(
        navigator.mediaDevices?.getUserMedia ||
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia
      )

      if (hasRTCPeerConnection && hasGetUserMedia) {
        setWebrtcSupport(true)
        return {
          name: "Soporte WebRTC",
          status: "success",
          message: "WebRTC completamente soportado",
          details: "RTCPeerConnection y getUserMedia disponibles",
          timestamp: new Date(),
        }
      } else {
        setWebrtcSupport(false)
        return {
          name: "Soporte WebRTC",
          status: "error",
          message: "WebRTC no soportado completamente",
          details: `RTCPeerConnection: ${hasRTCPeerConnection}, getUserMedia: ${hasGetUserMedia}`,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      setWebrtcSupport(false)
      return {
        name: "Soporte WebRTC",
        status: "error",
        message: "Error verificando WebRTC",
        details: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      }
    }
  }

  // Verificar acceso a medios
  const checkMediaAccess = async (): Promise<TestResult[]> => {
    const results: TestResult[] = []
    const support = { camera: false, microphone: false, screenShare: false }

    // Verificar cámara
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
      support.camera = true
      results.push({
        name: "Acceso a Cámara",
        status: "success",
        message: "Cámara accesible",
        timestamp: new Date(),
      })
    } catch (error) {
      results.push({
        name: "Acceso a Cámara",
        status: "warning",
        message: "Cámara no accesible",
        details: error instanceof Error ? error.message : "Permiso denegado o no disponible",
        timestamp: new Date(),
      })
    }

    // Verificar micrófono
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      support.microphone = true
      results.push({
        name: "Acceso a Micrófono",
        status: "success",
        message: "Micrófono accesible",
        timestamp: new Date(),
      })
    } catch (error) {
      results.push({
        name: "Acceso a Micrófono",
        status: "warning",
        message: "Micrófono no accesible",
        details: error instanceof Error ? error.message : "Permiso denegado o no disponible",
        timestamp: new Date(),
      })
    }

    // Verificar compartir pantalla
    try {
      if (navigator.mediaDevices.getDisplayMedia) {
        support.screenShare = true
        results.push({
          name: "Compartir Pantalla",
          status: "success",
          message: "Compartir pantalla soportado",
          details: "getDisplayMedia disponible",
          timestamp: new Date(),
        })
      } else {
        results.push({
          name: "Compartir Pantalla",
          status: "error",
          message: "Compartir pantalla no soportado",
          details: "getDisplayMedia no disponible",
          timestamp: new Date(),
        })
      }
    } catch (error) {
      results.push({
        name: "Compartir Pantalla",
        status: "error",
        message: "Error verificando compartir pantalla",
        details: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      })
    }

    setMediaSupport(support)
    return results
  }

  // Verificar servidor
  const checkServerStatus = async (): Promise<TestResult> => {
    try {
      const response = await fetch("/api/socket/status")
      const data = await response.json()

      if (response.ok) {
        if (data.mode === "vercel") {
          setServerStatus("vercel")
          return {
            name: "Estado del Servidor",
            status: "warning",
            message: "Ejecutándose en Vercel (modo limitado)",
            details: "WebSockets no disponibles, usar WhatsApp para asistencia real",
            timestamp: new Date(),
          }
        } else {
          setServerStatus("online")
          return {
            name: "Estado del Servidor",
            status: "success",
            message: "Servidor FULLASISTENTE online",
            details: `Modo: ${data.mode}, WebSockets: ${data.websockets}`,
            timestamp: new Date(),
          }
        }
      } else {
        setServerStatus("offline")
        return {
          name: "Estado del Servidor",
          status: "error",
          message: "Servidor no disponible",
          details: `Status: ${response.status}`,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      setServerStatus("offline")
      return {
        name: "Estado del Servidor",
        status: "error",
        message: "Error conectando al servidor",
        details: error instanceof Error ? error.message : "Error de red",
        timestamp: new Date(),
      }
    }
  }

  // Verificar conectividad
  const checkConnectivity = async (): Promise<TestResult[]> => {
    const results: TestResult[] = []

    // Verificar conexión a internet
    results.push({
      name: "Conexión a Internet",
      status: navigator.onLine ? "success" : "error",
      message: navigator.onLine ? "Conectado a internet" : "Sin conexión a internet",
      timestamp: new Date(),
    })

    // Verificar velocidad de conexión (aproximada)
    try {
      const startTime = performance.now()
      await fetch("/api/socket/status", { cache: "no-cache" })
      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)

      results.push({
        name: "Latencia del Servidor",
        status: latency < 500 ? "success" : latency < 1000 ? "warning" : "error",
        message: `${latency}ms`,
        details: latency < 500 ? "Excelente" : latency < 1000 ? "Buena" : "Lenta",
        timestamp: new Date(),
      })
    } catch (error) {
      results.push({
        name: "Latencia del Servidor",
        status: "error",
        message: "No se pudo medir",
        details: "Error de conectividad",
        timestamp: new Date(),
      })
    }

    return results
  }

  // Verificar compatibilidad del navegador
  const checkBrowserCompatibility = (): TestResult[] => {
    const results: TestResult[] = []
    const userAgent = navigator.userAgent.toLowerCase()

    // Detectar navegador
    let browser = "unknown"
    let version = "unknown"

    if (userAgent.includes("chrome")) {
      browser = "Chrome"
      const match = userAgent.match(/chrome\/(\d+)/)
      version = match ? match[1] : "unknown"
    } else if (userAgent.includes("firefox")) {
      browser = "Firefox"
      const match = userAgent.match(/firefox\/(\d+)/)
      version = match ? match[1] : "unknown"
    } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      browser = "Safari"
      const match = userAgent.match(/version\/(\d+)/)
      version = match ? match[1] : "unknown"
    } else if (userAgent.includes("edge")) {
      browser = "Edge"
      const match = userAgent.match(/edge\/(\d+)/)
      version = match ? match[1] : "unknown"
    }

    // Verificar compatibilidad
    const isCompatible = ["chrome", "firefox", "safari", "edge"].some((b) => userAgent.includes(b))

    results.push({
      name: "Navegador",
      status: isCompatible ? "success" : "warning",
      message: `${browser} ${version}`,
      details: isCompatible ? "Navegador compatible" : "Navegador no probado",
      timestamp: new Date(),
    })

    // Verificar características modernas
    const features = {
      "ES6 Modules": "noModule" in HTMLScriptElement.prototype,
      "Fetch API": "fetch" in window,
      WebSockets: "WebSocket" in window,
      "Local Storage": "localStorage" in window,
      "Session Storage": "sessionStorage" in window,
    }

    Object.entries(features).forEach(([feature, supported]) => {
      results.push({
        name: feature,
        status: supported ? "success" : "error",
        message: supported ? "Soportado" : "No soportado",
        timestamp: new Date(),
      })
    })

    return results
  }

  // Ejecutar todas las pruebas
  const runAllTests = async () => {
    setIsRunning(true)
    setTests([])

    const allTests: TestResult[] = []

    // Obtener información del sistema
    setSystemInfo(getSystemInfo())

    // Ejecutar pruebas secuencialmente
    try {
      // Compatibilidad del navegador
      allTests.push(...checkBrowserCompatibility())
      setTests([...allTests])

      // Estado del servidor
      const serverTest = await checkServerStatus()
      allTests.push(serverTest)
      setTests([...allTests])

      // Soporte WebRTC
      const webrtcTest = await checkWebRTCSupport()
      allTests.push(webrtcTest)
      setTests([...allTests])

      // Conectividad
      const connectivityTests = await checkConnectivity()
      allTests.push(...connectivityTests)
      setTests([...allTests])

      // Acceso a medios (puede requerir permisos del usuario)
      const mediaTests = await checkMediaAccess()
      allTests.push(...mediaTests)
      setTests([...allTests])
    } catch (error) {
      console.error("Error ejecutando pruebas:", error)
    }

    setIsRunning(false)
  }

  // Ejecutar pruebas al cargar
  useEffect(() => {
    runAllTests()
  }, [])

  // WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = "573052891719"
    const message = "hola quiero asistencia - Verificación de sistema"
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "pending":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "default"
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "pending":
        return "outline"
    }
  }

  const successCount = tests.filter((t) => t.status === "success").length
  const errorCount = tests.filter((t) => t.status === "error").length
  const warningCount = tests.filter((t) => t.status === "warning").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  FULLASISTENTE
                </span>
                <p className="text-xs text-gray-500">Verificación del Sistema</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Button onClick={runAllTests} disabled={isRunning} size="sm" variant="outline">
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Verificar Nuevamente
                  </>
                )}
              </Button>

              <Button onClick={openWhatsApp} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                <MessageCircle className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>

              <Link href="/control">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Settings className="h-4 w-4 mr-1" />
                  Panel Control
                </Button>
              </Link>

              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-1" />
                  Inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verificación del Sistema FULLASISTENTE</h1>
          <p className="text-lg text-gray-600 mb-6">
            Verificación completa de compatibilidad y funcionalidades para el control remoto
          </p>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-gray-600">Exitosas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-sm text-gray-600">Advertencias</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-gray-600">Errores</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{tests.length}</div>
                <div className="text-sm text-gray-600">Total Pruebas</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Resultados de Pruebas */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Resultados de Verificación</span>
                </CardTitle>
                <CardDescription>Estado detallado de todas las funcionalidades del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tests.length === 0 && isRunning ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600">Ejecutando verificaciones...</p>
                    </div>
                  ) : (
                    tests.map((test, index) => (
                      <div key={`test-${index}-${test.name}`} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <div className="flex-shrink-0 mt-0.5">{getStatusIcon(test.status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{test.name}</h4>
                            <Badge variant={getStatusBadge(test.status)}>{test.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                          {test.details && <p className="text-xs text-gray-500 mt-1">{test.details}</p>}
                          {test.timestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {test.timestamp.toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recomendaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Recomendaciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serverStatus === "vercel" && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Modo Vercel Detectado</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        La aplicación está ejecutándose en Vercel con funcionalidad limitada. Para asistencia técnica
                        completa:
                      </p>
                      <Button onClick={openWhatsApp} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <Phone className="h-4 w-4 mr-2" />
                        Contactar por WhatsApp
                      </Button>
                    </div>
                  )}

                  {webrtcSupport === false && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">WebRTC No Soportado</h4>
                      <p className="text-sm text-red-700">
                        Tu navegador no soporta WebRTC completamente. Recomendamos usar Chrome, Firefox o Edge
                        actualizados.
                      </p>
                    </div>
                  )}

                  {mediaSupport && (!mediaSupport.camera || !mediaSupport.microphone) && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Permisos de Medios</h4>
                      <p className="text-sm text-yellow-700">
                        Algunos permisos de medios no están disponibles. Asegúrate de permitir el acceso a la cámara y
                        micrófono cuando se solicite.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Para Mejor Experiencia</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Usa una conexión a internet estable</li>
                      <li>• Permite el acceso a cámara y micrófono</li>
                      <li>• Usa navegadores actualizados (Chrome, Firefox, Edge)</li>
                      <li>• Cierra otras aplicaciones que usen mucho ancho de banda</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información del Sistema */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Información del Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemInfo ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Plataforma:</span>
                      <p className="text-gray-600">{systemInfo.platform}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Idioma:</span>
                      <p className="text-gray-600">{systemInfo.language}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Resolución:</span>
                      <p className="text-gray-600">{systemInfo.screenResolution}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Ventana:</span>
                      <p className="text-gray-600">{systemInfo.viewport}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Zona Horaria:</span>
                      <p className="text-gray-600">{systemInfo.timezone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Conexión:</span>
                      <p className="text-gray-600">{systemInfo.connection || "Desconocida"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Estado:</span>
                      <Badge variant={systemInfo.onlineStatus ? "default" : "destructive"}>
                        {systemInfo.onlineStatus ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Obteniendo información...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Capacidades de Medios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Capacidades de Medios</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mediaSupport ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Camera className="h-4 w-4" />
                        <span className="text-sm">Cámara</span>
                      </div>
                      <Badge variant={mediaSupport.camera ? "default" : "destructive"}>
                        {mediaSupport.camera ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mic className="h-4 w-4" />
                        <span className="text-sm">Micrófono</span>
                      </div>
                      <Badge variant={mediaSupport.microphone ? "default" : "destructive"}>
                        {mediaSupport.microphone ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Share className="h-4 w-4" />
                        <span className="text-sm">Compartir Pantalla</span>
                      </div>
                      <Badge variant={mediaSupport.screenShare ? "default" : "destructive"}>
                        {mediaSupport.screenShare ? "Soportado" : "No soportado"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Verificando capacidades...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contacto de Soporte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Soporte Técnico</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">¿Problemas con la verificación?</p>
                    <p className="font-medium text-gray-900">Armando Ovalle</p>
                    <p className="text-sm text-gray-600">Desarrollador y Soporte Técnico</p>
                  </div>
                  <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp: +57 305 289 1719
                  </Button>
                  <p className="text-xs text-gray-500">Mensaje: "hola quiero asistencia - Verificación"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 FULLASISTENTE - Desarrollado por <span className="text-green-400 font-semibold">Armando Ovalle</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">Verificación del Sistema v1.0</p>
        </div>
      </footer>
    </div>
  )
}
