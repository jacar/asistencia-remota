import { useEffect, useCallback, useRef } from "react"
import { useNotificationContext } from "@/contexts/notification-context"

export const useNotificationListener = (roomId?: string, isHost?: boolean, onControlAccepted?: () => void) => {
  const { addNotification } = useNotificationContext()
  const processedNotifications = useRef<Set<string>>(new Set())
  const lastCheckTime = useRef<number>(Date.now())

  const checkForNotifications = useCallback(async () => {
    if (!roomId) {
      console.log("No roomId provided, skipping notification check")
      return
    }

    try {
      console.log(`🔍 Checking notifications for room: ${roomId}, isHost: ${isHost}`)
      
      // Incluir timestamp de última verificación para optimizar
      const response = await fetch(`/api/notifications?roomId=${roomId}&lastCheck=${lastCheckTime.current}`)
      
      if (response.ok) {
        const data = await response.json()
        const notifications = data.notifications || []
        
        console.log(`📨 Found ${notifications.length} new notifications for room ${roomId}`)
        console.log("Notifications:", notifications)

        // Actualizar timestamp de última verificación
        lastCheckTime.current = Date.now()

        // Procesar solo notificaciones nuevas que no hemos visto antes
        notifications.forEach((notification: any) => {
          if (processedNotifications.current.has(notification.id)) {
            console.log(`⏭️ Skipping already processed notification: ${notification.id}`)
            return // Ya procesamos esta notificación
          }

          console.log(`✅ Processing new notification: ${notification.id} (${notification.type})`)

          // Marcar como procesada
          processedNotifications.current.add(notification.id)

          // Solo el cliente (no host) debe recibir solicitudes de control
          if (notification.type === "control_request" && !isHost) {
            console.log("🎯 Client received control request")
            addNotification({
              type: "warning",
              title: "Solicitud de Control Remoto",
              message: "El técnico está solicitando acceso para controlar tu computadora. ¿Permites el acceso?",
              duration: 30000,
              onAccept: async () => {
                console.log("✅ Client accepted control request")
                // Enviar confirmación de aceptación
                try {
                  const acceptResponse = await fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      roomId,
                      type: "control_accepted",
                      message: "El cliente ha aceptado tu solicitud de control remoto",
                      sender: "client"
                    })
                  })
                  
                  if (acceptResponse.ok) {
                    console.log("✅ Acceptance notification sent successfully")
                  } else {
                    console.error("❌ Failed to send acceptance notification")
                  }
                } catch (error) {
                  console.error("Error sending acceptance notification:", error)
                }

                addNotification({
                  type: "success",
                  title: "Control Remoto Aceptado",
                  message: "Has aceptado la solicitud de control remoto. El técnico ahora puede controlar tu computadora.",
                  duration: 5000,
                })
              },
              onReject: async () => {
                console.log("❌ Client rejected control request")
                // Enviar confirmación de rechazo
                try {
                  const rejectResponse = await fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      roomId,
                      type: "control_rejected",
                      message: "El cliente ha rechazado tu solicitud de control remoto",
                      sender: "client"
                    })
                  })
                  
                  if (rejectResponse.ok) {
                    console.log("✅ Rejection notification sent successfully")
                  } else {
                    console.error("❌ Failed to send rejection notification")
                  }
                } catch (error) {
                  console.error("Error sending rejection notification:", error)
                }

                addNotification({
                  type: "error",
                  title: "Control Remoto Rechazado",
                  message: "Has rechazado la solicitud de control remoto. Tu computadora permanece segura.",
                  duration: 5000,
                })
              },
            })
          }

          // Solo el técnico (host) debe recibir confirmaciones
          if ((notification.type === "control_accepted" || notification.type === "control_rejected") && isHost) {
            console.log(`🎯 Host received ${notification.type} notification`)
            addNotification({
              type: notification.type === "control_accepted" ? "success" : "error",
              title: notification.type === "control_accepted" ? "Control Remoto Aceptado" : "Control Remoto Rechazado",
              message: notification.message,
              duration: 5000,
            })
            
            // Habilitar control remoto si fue aceptado
            if (notification.type === "control_accepted" && onControlAccepted) {
              console.log("🎮 Enabling remote control")
              onControlAccepted()
            }
          }
        })
      } else {
        console.error(`❌ Failed to fetch notifications: ${response.status}`)
      }
    } catch (error) {
      console.error("Error checking for notifications:", error)
    }
  }, [roomId, isHost, addNotification, onControlAccepted])

  useEffect(() => {
    if (!roomId) {
      console.log("No roomId, not starting notification listener")
      return
    }

    console.log(`🚀 Starting notification listener for room: ${roomId}, isHost: ${isHost}`)

    // Verificar notificaciones cada 3 segundos (más frecuente para mejor respuesta)
    const interval = setInterval(checkForNotifications, 3000)
    
    // Verificar inmediatamente al montar
    checkForNotifications()

    return () => {
      console.log("🛑 Stopping notification listener")
      clearInterval(interval)
    }
  }, [roomId, checkForNotifications])

  return { checkForNotifications }
} 