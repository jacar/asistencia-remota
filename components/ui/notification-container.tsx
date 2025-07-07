"use client"

import React from "react"
import Notification from "./notification"
import { useNotificationContext } from "@/contexts/notification-context"

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationContext()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id || `notification-${index}`}
          style={{
            transform: `translateY(${index * 20}px)`,
          }}
        >
          <Notification
            {...notification}
            id={notification.id || `notification-${index}`}
            onClose={() => removeNotification(notification.id || `notification-${index}`)}
          />
        </div>
      ))}
    </div>
  )
}

export default NotificationContainer 