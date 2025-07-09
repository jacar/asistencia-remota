import { Link } from "react-router-dom"
import { Monitor, Shield, Zap, Users, Download, Globe } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { socketService } from "../services/socket"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../../../components/ui/carousel"

const Home = () => {
  const [carouselApi, setCarouselApi] = useState(null)
  const autoPlayRef = useRef()

  useEffect(() => {
    if (!carouselApi) return;
    autoPlayRef.current = setInterval(() => {
      if (carouselApi) {
        if (carouselApi.canScrollNext()) {
          carouselApi.scrollNext();
        } else {
          carouselApi.scrollTo(0); // Vuelve al inicio
        }
      }
    }, 3000);
    return () => clearInterval(autoPlayRef.current);
  }, [carouselApi]);

  useEffect(() => {
    // Mostrar mensaje de espera
    socketService.on("permission-denied", (data) => {
      console.log("❌ Permiso denegado:", data)
      toast.error(
        <div className="space-y-1">
          <p className="font-medium">Conexión Rechazada</p>
          <p className="text-sm">{data?.message || "El host ha rechazado tu conexión."}</p>
          {data?.timestamp && (
            <p className="text-xs text-gray-400">
              {new Date(data.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>,
        {
          duration: 5000,
          position: "top-right",
        }
      )
    })
    
    socketService.on("permission-granted", (data) => {
      console.log("✅ Permiso concedido:", data)
      toast.success(
        <div className="space-y-1">
          <p className="font-medium">Conexión Aprobada</p>
          <p className="text-sm">{data?.message || "El host ha aprobado tu conexión."}</p>
          {data?.timestamp && (
            <p className="text-xs text-gray-400">
              {new Date(data.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>,
        {
          duration: 5000,
          position: "top-right",
        }
      )
    })
    
    // Mensaje de espera cuando se une a una sala sin permiso
    socketService.on("permission-denied", (data) => {
      if (data?.message?.includes("Esperando")) {
        toast(
          <div className="space-y-1">
            <p className="font-medium">Esperando Aprobación</p>
            <p className="text-sm">Tu conexión está pendiente de aprobación del host.</p>
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
              <span className="text-xs text-gray-500">Esperando respuesta...</span>
            </div>
          </div>,
          {
            duration: 10000,
            position: "top-right",
          }
        )
      }
    })
    
    // Notificaciones de control remoto mejoradas
    socketService.on("remote-control-request", (data) => {
      console.log("🎮 Solicitud de control remoto recibida:", data)
      toast((t) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🎮</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Solicitud de Control Remoto
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {data.message || "El técnico solicita controlar tu dispositivo"}
            </p>
            {data.fromId && (
              <p className="text-xs text-gray-500 mt-1">
                Usuario: {data.fromId}
              </p>
            )}
            {data.timestamp && (
              <p className="text-xs text-gray-400 mt-1">
                {new Date(data.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => {
                socketService.emit("remote-control-response", { allowed: true, targetId: data.fromId })
                toast.dismiss(t.id)
                toast.success("✅ Control remoto permitido")
              }}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
            >
              Permitir
            </button>
            <button
              onClick={() => {
                socketService.emit("remote-control-response", { allowed: false, targetId: data.fromId })
                toast.dismiss(t.id)
                toast.error("❌ Control remoto rechazado")
              }}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
            >
              Rechazar
            </button>
          </div>
        </div>
      ), {
        duration: 15000,
        position: "top-right",
        style: {
          minWidth: "350px",
          padding: "12px",
        },
      })
    })
    
    return () => {
      socketService.off("permission-denied")
      socketService.off("permission-granted")
      socketService.off("remote-control-request")
    }
  }, [])

  const heroSlides = [
    {
      title: "Control Remoto Profesional",
      description: "Accede y controla dispositivos desde cualquier parte del mundo de forma segura y rápida.",
      color: "from-primary-400 to-primary-600",
    },
    {
      title: "Multiusuario y Colaboración",
      description: "Permite sesiones con múltiples usuarios y roles para soporte y trabajo en equipo.",
      color: "from-green-400 to-green-600",
    },
    {
      title: "Transferencia de Archivos",
      description: "Envía y recibe archivos fácilmente durante la sesión remota.",
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "Seguridad y Privacidad",
      description: "Todas las conexiones están cifradas de extremo a extremo.",
      color: "from-purple-400 to-purple-600",
    },
  ]

  return (
    <div className="bg-white">
      {/* Hero Section con Slider */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <Carousel className="w-full max-w-2xl mx-auto mb-8" setApi={setCarouselApi}>
                  <CarouselContent>
                    {heroSlides.map((slide, idx) => (
                      <CarouselItem key={idx}>
                        <div className={`rounded-xl p-8 text-white bg-gradient-to-r ${slide.color} shadow-lg flex flex-col items-center justify-center min-h-[200px]`}>
                          <h2 className="text-3xl font-bold mb-2 text-center">{slide.title}</h2>
                          <p className="text-lg text-center">{slide.description}</p>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Remote Desktop</span>{" "}
                  <span className="block text-primary-600 xl:inline">Made Simple</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Open source remote desktop solution built with modern web technologies. Secure, fast, and reliable
                  remote access for everyone. No downloads required.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/demo"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    >
                      Try Demo
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="https://github.com"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-primary-400 to-primary-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <Monitor className="h-32 w-32 text-white opacity-50" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for remote access
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Built with modern web technologies for the best user experience
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Monitor className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Remote Desktop Control</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Full remote desktop control with mouse and keyboard input. Works seamlessly across all platforms.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure & Encrypted</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  End-to-end encryption ensures your data stays private. Built with security best practices.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Lightning Fast</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  WebRTC technology provides low-latency connections for smooth remote desktop experience.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Multi-User Sessions</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Support for multiple users in the same session with role-based permissions.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Download className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">File Transfer</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Easy file transfer between connected devices with drag-and-drop support.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Globe className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Cross-Platform</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Works on any device with a modern web browser. No software installation required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-600">Try our demo today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/demo"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Try Demo
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="https://github.com"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
              >
                View Source
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
