import { useState, useEffect, useCallback } from "react"

interface PushNotification {
  id: string
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    // Verificar si las notificaciones push están soportadas
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn("Push notifications not supported")
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === "granted"
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return false
    }
  }, [isSupported])

  const subscribeToPush = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || permission !== "granted") {
      console.warn("Push notifications not available")
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      
      setSubscription(subscription)
      return subscription
    } catch (error) {
      console.error("Error subscribing to push notifications:", error)
      return null
    }
  }, [isSupported, permission])

  const sendNotification = useCallback((notification: Omit<PushNotification, "id">) => {
    if (!isSupported || permission !== "granted") {
      console.warn("Cannot send notification - not supported or permission denied")
      return
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fullNotification: PushNotification = {
      ...notification,
      id,
    }

    // Enviar notificación local
    new Notification(fullNotification.title, {
      body: fullNotification.body,
      icon: fullNotification.icon || "/favicon.ico",
      badge: fullNotification.badge,
      tag: fullNotification.tag,
      data: fullNotification.data,
    })
  }, [isSupported, permission])

  const sendRemoteNotification = useCallback(async (
    roomId: string,
    type: "control_request" | "control_accepted" | "control_rejected",
    message: string
  ) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          type,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send notification")
      }

      return await response.json()
    } catch (error) {
      console.error("Error sending remote notification:", error)
      return null
    }
  }, [])

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    sendNotification,
    sendRemoteNotification,
  }
} 