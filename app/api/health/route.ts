import { NextResponse } from "next/server"

export async function GET() {
  try {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: "1.0.0",
      server: "FULLASISTENTE",
      developer: "Armando Ovalle",
      whatsapp: "+57 305 289 1719",
      services: {
        api: "operational",
        websockets: process.env.VERCEL === "1" ? "limited" : "operational",
        database: process.env.DATABASE_URL ? "operational" : "not_configured",
      },
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024,
      },
      platform: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    }

    return NextResponse.json(healthData)
  } catch (error) {
    console.error("Error en health check:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Error desconocido",
        developer: "Armando Ovalle",
        whatsapp: "+57 305 289 1719",
      },
      { status: 500 },
    )
  }
}
