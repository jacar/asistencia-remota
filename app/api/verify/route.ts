import { NextResponse } from "next/server"

export async function GET() {
  try {
    const verificationData = {
      timestamp: new Date().toISOString(),
      server: "FULLASISTENTE",
      developer: "Armando Ovalle",
      whatsapp: "+57 305 289 1719",
      version: "1.0.0",
      environment: {
        vercel: process.env.VERCEL === "1",
        nodeEnv: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION || "unknown",
      },
      capabilities: {
        api: true,
        websockets: process.env.VERCEL !== "1",
        database: !!process.env.DATABASE_URL,
        storage: !!process.env.STORAGE_URL,
      },
      endpoints: {
        status: "/api/socket/status",
        socketio: "/api/socket/io",
        verify: "/api/verify",
      },
      recommendations: [
        "Para asistencia técnica completa, contactar por WhatsApp",
        "Usar navegadores modernos (Chrome, Firefox, Edge)",
        "Permitir acceso a cámara y micrófono cuando se solicite",
        "Mantener conexión a internet estable",
      ],
    }

    return NextResponse.json(verificationData)
  } catch (error) {
    console.error("Error en verificación:", error)
    return NextResponse.json(
      {
        error: "Error en verificación del sistema",
        timestamp: new Date().toISOString(),
        developer: "Armando Ovalle",
        whatsapp: "+57 305 289 1719",
        message: "Contacta por WhatsApp para asistencia",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Log de datos de verificación del cliente
    console.log("Datos de verificación del cliente:", {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
      clientData: body,
    })

    return NextResponse.json({
      message: "Datos de verificación recibidos",
      timestamp: new Date().toISOString(),
      developer: "Armando Ovalle",
      whatsapp: "+57 305 289 1719",
      status: "success",
    })
  } catch (error) {
    console.error("Error procesando verificación:", error)
    return NextResponse.json(
      {
        error: "Error procesando datos de verificación",
        timestamp: new Date().toISOString(),
        developer: "Armando Ovalle",
        whatsapp: "+57 305 289 1719",
      },
      { status: 500 },
    )
  }
}
