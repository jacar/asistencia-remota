import { useState, useCallback } from "react"
import { NotificationProps } from "@/components/ui/notification"

export interface NotificationData extends Omit<NotificationProps, "id"> {
  id?: string
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const addNotification = useCallback((notification: NotificationData) => {
    const id = notification.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: NotificationProps = {
      ...notification,
      id,
    }
    
    setNotifications(prev => [...prev, newNotification])
    
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  }
} 