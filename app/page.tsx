"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Monitor,
  Shield,
  Zap,
  Users,
  MessageCircle,
  Phone,
  CheckCircle,
  Star,
  Globe,
  Headphones,
  ArrowRight,
  Play,
} from "lucide-react"

export default function HomePage() {
  const openWhatsApp = () => {
    const phoneNumber = "573052891719"
    const message = "hola quiero asistencia"
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  FULLASISTENTE
                </span>
                <p className="text-xs text-gray-500">por Armando Ovalle</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={openWhatsApp} className="bg-green-500 hover:bg-green-600 text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Link href="/control">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
              <Star className="h-3 w-3 mr-1" />
              Control Remoto Profesional
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                FULLASISTENTE
              </span>
              <br />
              <span className="text-2xl md:text-4xl text-gray-700">Soporte Técnico 24/7</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Solución profesional de control remoto y asistencia técnica desarrollada por{" "}
              <span className="font-semibold text-green-600">Armando Ovalle</span>. Obtén ayuda inmediata para tu
              computador desde cualquier lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/control">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  <Monitor className="h-5 w-5 mr-2" />
                  Comenzar Ahora
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button
                onClick={openWhatsApp}
                size="lg"
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 text-lg bg-transparent"
              >
                <Phone className="h-5 w-5 mr-2" />
                WhatsApp: +57 305 289 1719
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir FULLASISTENTE?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tecnología avanzada y soporte humano profesional para resolver todos tus problemas técnicos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">100% Seguro</CardTitle>
                <CardDescription>
                  Conexión encriptada y segura. Tu privacidad y datos están completamente protegidos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Conexión Instantánea</CardTitle>
                <CardDescription>
                  Conecta en segundos con nuestro sistema de códigos únicos. Sin instalaciones complicadas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Soporte Experto</CardTitle>
                <CardDescription>
                  Técnicos certificados listos para ayudarte. Experiencia comprobada en soporte técnico.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-colors">
              <CardHeader>
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Acceso Universal</CardTitle>
                <CardDescription>
                  Funciona desde cualquier navegador web. Compatible con Windows, Mac, Linux y dispositivos móviles.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader>
                <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Soporte 24/7</CardTitle>
                <CardDescription>
                  Disponible las 24 horas del día, 7 días a la semana. Asistencia inmediata cuando la necesites.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-indigo-200 transition-colors">
              <CardHeader>
                <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Garantía Total</CardTitle>
                <CardDescription>
                  Satisfacción garantizada. Si no resolvemos tu problema, no pagas. Compromiso con la excelencia.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
            <p className="text-xl text-gray-600">Obtén ayuda técnica en 3 simples pasos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Genera tu Código</h3>
              <p className="text-gray-600">
                Haz clic en "Generar Código" para crear tu código único de 6 dígitos. Este código es tu llave de acceso
                segura.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Comparte por WhatsApp</h3>
              <p className="text-gray-600">
                Envía tu código al técnico por WhatsApp (+57 305 289 1719) con el mensaje "hola quiero asistencia".
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Recibe Asistencia</h3>
              <p className="text-gray-600">
                El técnico se conectará a tu sesión y podrá ver tu pantalla para ayudarte a resolver cualquier problema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para resolver tus problemas técnicos?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de usuarios que confían en FULLASISTENTE para su soporte técnico
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/control">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                <Monitor className="h-5 w-5 mr-2" />
                Comenzar Sesión Ahora
              </Button>
            </Link>
            <Button
              onClick={openWhatsApp}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contactar por WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">FULLASISTENTE</span>
              </div>
              <p className="text-gray-400 mb-4">
                Solución profesional de control remoto y asistencia técnica desarrollada con tecnología de vanguardia.
              </p>
              <p className="text-sm text-gray-500">© 2024 FULLASISTENTE. Todos los derechos reservados.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-400">
                <p>
                  <strong className="text-white">Desarrollador:</strong> Armando Ovalle
                </p>
                <p>
                  <strong className="text-white">WhatsApp:</strong> +57 305 289 1719
                </p>
                <p>
                  <strong className="text-white">Mensaje:</strong> "hola quiero asistencia"
                </p>
                <p>
                  <strong className="text-white">Horario:</strong> 24/7 Disponible
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Control Remoto Seguro</li>
                <li>• Soporte Técnico Especializado</li>
                <li>• Resolución de Problemas</li>
                <li>• Instalación de Software</li>
                <li>• Configuración de Sistemas</li>
                <li>• Asistencia 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              Desarrollado con ❤️ por <span className="text-green-400 font-semibold">Armando Ovalle</span> - Especialista
              en Soporte Técnico
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          ¿Necesitas ayuda?
        </span>
      </button>
    </div>
  )
}
