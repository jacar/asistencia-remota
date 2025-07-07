import { NextRequest, NextResponse } from "next/server"

// Simular almacenamiento de notificaciones con persistencia mejorada
let notifications: Array<{
  id: string
  roomId: string
  type: "control_request" | "control_accepted" | "control_rejected"
  message: string
  timestamp: Date
  sender?: string
}> = []

// Limpiar notificaciones antiguas (más de 1 hora)
const cleanupOldNotifications = () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  notifications = notifications.filter(n => n.timestamp > oneHourAgo)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, type, message, sender } = body

    if (!roomId || !type || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Limpiar notificaciones antiguas
    cleanupOldNotifications()

    const notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      type,
      message,
      timestamp: new Date(),
      sender,
    }

    notifications.push(notification)
    
    console.log(`📨 Created notification: ${type} for room ${roomId}`)
    console.log(`📊 Total notifications: ${notifications.length}`)

    return NextResponse.json({ 
      success: true, 
      notification,
      totalNotifications: notifications.length 
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Error creating notification" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("roomId")
    const lastCheck = searchParams.get("lastCheck")

    if (!roomId) {
      return NextResponse.json({ error: "Room ID required" }, { status: 400 })
    }

    // Limpiar notificaciones antiguas
    cleanupOldNotifications()

    let roomNotifications = notifications.filter(n => n.roomId === roomId)
    
    // Si se proporciona lastCheck, solo devolver notificaciones más recientes
    if (lastCheck) {
      const lastCheckTime = new Date(parseInt(lastCheck))
      roomNotifications = roomNotifications.filter(n => n.timestamp > lastCheckTime)
    }

    console.log(`📨 Returning ${roomNotifications.length} notifications for room ${roomId}`)
    
    return NextResponse.json({ 
      notifications: roomNotifications,
      totalNotifications: notifications.length,
      roomNotifications: roomNotifications.length
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Error fetching notifications" }, { status: 500 })
  }
} 