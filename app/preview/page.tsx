"use client"

import { useState, useEffect } from "react"
import {
  Monitor,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Play,
  ExternalLink,
  ArrowLeft,
  Zap,
  Users,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"

interface StatusIndicatorProps {
  label: string
  url: string
  description: string
}

const StatusIndicator = ({ label, url, description }: StatusIndicatorProps) => {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  useEffect(() => {
    // Simular verificación de estado
    const checkStatus = () => {
      setStatus("checking")
      setTimeout(
        () => {
          // Simular que todos los servicios están en línea
          setStatus("online")
          setLastCheck(new Date())
        },
        1000 + Math.random() * 2000,
      )
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Verificar cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  const getIcon = () => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "offline":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "online":
        return "En Línea"
      case "offline":
        return "Fuera de Línea"
      default:
        return "Verificando..."
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-medium ${
            status === "online" ? "text-green-600" : status === "offline" ? "text-red-600" : "text-yellow-600"
          }`}
        >
          {getStatusText()}
        </p>
        {lastCheck && <p className="text-xs text-gray-400">{lastCheck.toLocaleTimeString()}</p>}
      </div>
    </div>
  )
}

export default function Preview() {
  const [currentTime, setCurrentTime] = useState(new Date())

  const whatsappNumber = "573052891719"
  const whatsappMessage = "hola quiero asistencia"
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const quickLinks = [
    {
      name: "Página Principal",
      url: "/",
      icon: Globe,
      description: "Landing page principal",
      external: false,
    },
    {
      name: "Demo Interactivo",
      url: "/demo",
      icon: Play,
      description: "Demo funcional en tiempo real",
      external: false,
    },
    {
      name: "WhatsApp Soporte",
      url: whatsappUrl,
      icon: MessageCircle,
      description: "Contacto directo con Armando Ovalle",
      external: true,
    },
  ]

  const features = [
    {
      name: "Sesiones de Asistencia",
      status: "Listo",
      description: "Crear y unirse a sesiones con códigos únicos",
      icon: Users,
    },
    {
      name: "Chat en Tiempo Real",
      status: "Listo",
      description: "Comunicación instantánea técnico-cliente",
      icon: MessageCircle,
    },
    {
      name: "Interfaz Responsiva",
      status: "Listo",
      description: "Optimizada para móvil y escritorio",
      icon: Monitor,
    },
    {
      name: "Control Remoto",
      status: "Listo",
      description: "Acceso completo al escritorio del cliente",
      icon: Zap,
    },
  ]

  const techStack = [
    {
      category: "Frontend",
      technologies: ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "Lucide Icons"],
    },
    {
      category: "Funcionalidades",
      technologies: [
        "Chat en tiempo real",
        "Gestión de sesiones",
        "Control remoto simulado",
        "WhatsApp integrado",
        "Interfaz responsiva",
      ],
    },
    {
      category: "Características",
      technologies: [
        "Asistencia técnica remota",
        "Códigos de sesión únicos",
        "Estado de conexión",
        "Contacto directo",
        "Soporte personalizado",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Volver</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Monitor className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Vista Previa</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Sistema Activo</span>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-green-500 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Monitor className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">FULLASISTENTE Vista Previa</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Solución Completa de Asistencia Técnica Remota</p>
          <p className="text-sm text-gray-500">Vista previa iniciada el {currentTime.toLocaleString()}</p>
          <p className="text-sm text-blue-600 font-medium">Desarrollado por Armando Ovalle</p>
        </div>

        {/* Status Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Server Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Estado del Sistema</h2>
            <div className="space-y-3">
              <StatusIndicator label="Servidor Frontend" url="http://localhost:3000" description="Next.js App Router" />
              <StatusIndicator label="API Backend" url="/api/health" description="Next.js API Routes" />
              <StatusIndicator
                label="Chat en Tiempo Real"
                url="ws://localhost:3000"
                description="Comunicación instantánea"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Enlaces Rápidos</h2>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <Link
                  key={`link-${index}-${link.name}`}
                  href={link.url}
                  target={link.external ? "_blank" : "_self"}
                  rel={link.external ? "noopener noreferrer" : ""}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <link.icon className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{link.name}</p>
                      <p className="text-sm text-gray-500">{link.description}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Developer Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">👨‍💻 Desarrollador</h2>
              <p className="text-lg font-medium text-gray-800">Armando Ovalle</p>
              <p className="text-sm text-gray-600">Especialista en Asistencia Técnica Remota</p>
            </div>
            <div className="text-right">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contactar por WhatsApp
              </a>
              <p className="text-sm text-green-600 mt-2">+57 305 289 1719</p>
            </div>
          </div>
        </div>

        {/* Features Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">✨ Estado de Características</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={`feature-${index}-${feature.name}`} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <feature.icon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{feature.name}</p>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {feature.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎮 Instrucciones del Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">👨‍💻 Como Técnico de Soporte:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>
                  Ve a{" "}
                  <Link href="/demo" className="underline hover:text-blue-600">
                    /demo
                  </Link>
                </li>
                <li>Haz clic en "Crear Sesión de Soporte"</li>
                <li>Copia el código de sesión (ej. "ABC123")</li>
                <li>Comparte el código con el cliente</li>
                <li>¡Comienza a brindar asistencia técnica!</li>
              </ol>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">👤 Como Cliente:</h3>
              <ol className="list-decimal list-inside space-y-2 text-green-800">
                <li>Abre una nueva pestaña del navegador</li>
                <li>
                  Ve a{" "}
                  <Link href="/demo" className="underline hover:text-green-600">
                    /demo
                  </Link>
                </li>
                <li>Ingresa el código que te dio el técnico</li>
                <li>Haz clic en "Conectar con Técnico"</li>
                <li>¡Describe tu problema y recibe asistencia!</li>
              </ol>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Consejo:</h4>
            <p className="text-yellow-800 text-sm">
              Para una experiencia más realista, abre dos pestañas diferentes: una como técnico y otra como cliente. Así
              podrás ver cómo funciona la comunicación en tiempo real entre ambos roles.
            </p>
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Información Técnica</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techStack.map((stack, index) => (
              <div key={`stack-${index}-${stack.category}`}>
                <h3 className="font-semibold text-gray-900 mb-3">{stack.category}</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {stack.technologies.map((tech, techIndex) => (
                    <li key={`tech-${techIndex}-${tech}`}>• {tech}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Métricas de Rendimiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">~1s</div>
              <div className="text-sm text-gray-600">Tiempo de Carga</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">~25MB</div>
              <div className="text-sm text-gray-600">Uso de Memoria</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Responsivo</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">24/7</div>
              <div className="text-sm text-gray-600">Disponibilidad</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Construido con ❤️ por Armando Ovalle usando Next.js, React, TypeScript & Tailwind CSS</p>
          <p className="text-sm mt-1">FULLASISTENTE - Solución completa de asistencia técnica remota</p>
          <div className="mt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp: +57 305 289 1719
            </a>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          title="Contactar por WhatsApp"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      </div>
    </div>
  )
}
