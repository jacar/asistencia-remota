import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar si estamos en Vercel o en desarrollo local
    const isVercel = process.env.VERCEL === "1"
    const isDevelopment = process.env.NODE_ENV === "development"

    // En Vercel, los WebSockets no están disponibles de la misma manera
    // que en un servidor tradicional, así que retornamos el estado apropiado
    if (isVercel) {
      return NextResponse.json({
        status: "limited",
        message: "Servidor en modo Vercel - Funcionalidad limitada",
        server: "FULLASISTENTE",
        developer: "Armando Ovalle",
        whatsapp: "+57 305 289 1719",
        mode: "vercel",
        websockets: false,
        recommendation: "Usar WhatsApp para asistencia directa",
        timestamp: new Date().toISOString(),
      })
    }

    if (isDevelopment) {
      return NextResponse.json({
        status: "development",
        message: "Servidor en modo desarrollo",
        server: "FULLASISTENTE",
        developer: "Armando Ovalle",
        whatsapp: "+57 305 289 1719",
        mode: "development",
        websockets: true,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      status: "online",
      message: "Servidor FULLASISTENTE activo",
      server: "FULLASISTENTE",
      developer: "Armando Ovalle",
      whatsapp: "+57 305 289 1719",
      mode: "production",
      websockets: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en status check:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error verificando estado del servidor",
        server: "FULLASISTENTE",
        developer: "Armando Ovalle",
        whatsapp: "+57 305 289 1719",
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
