# Sistema de Notificaciones para Control Remoto

## Descripción

Este sistema permite enviar notificaciones entre dos computadoras cuando se solicita control remoto. Cuando un técnico hace clic en "Solicitar Control", se envía una notificación al otro ordenador para pedir permiso.

## Características

### ✅ Notificaciones Push
- **Solicitud de Control**: Cuando el técnico solicita control, aparece una notificación en el otro ordenador
- **Aceptación/Rechazo**: El cliente puede aceptar o rechazar la solicitud
- **Confirmación**: El técnico recibe notificación del resultado

### ✅ Interfaz Visual
- **Indicador de Estado**: Muestra si las notificaciones están activas, denegadas o no soportadas
- **Notificaciones Emergentes**: Aparecen en la esquina superior derecha
- **Botones de Acción**: Aceptar/Rechazar con confirmación visual

### ✅ Seguridad
- **Permisos Requeridos**: Solicita permisos de notificación automáticamente
- **Confirmación Explícita**: El cliente debe aceptar explícitamente
- **Tiempo Límite**: 30 segundos para responder a la solicitud

## Cómo Funciona

### 1. Solicitar Control
```javascript
// El técnico hace clic en "Solicitar Control"
const requestRemoteControl = async () => {
  // Solicitar permisos si es necesario
  if (pushSupported && pushPermission !== "granted") {
    const granted = await requestPushPermission()
  }
  
  // Enviar notificación al otro ordenador
  await sendRemoteNotification(roomCode, "control_request", "Solicitud de control")
}
```

### 2. Recibir Notificación
```javascript
// El cliente recibe la notificación
addNotification({
  type: "warning",
  title: "Solicitud de Control Remoto",
  message: "¿Permites el acceso?",
  onAccept: () => {
    // Lógica para aceptar
  },
  onReject: () => {
    // Lógica para rechazar
  }
})
```

### 3. Confirmación
```javascript
// El técnico recibe confirmación
addNotification({
  type: "success", // o "error"
  title: "Control Remoto Aceptado", // o "Rechazado"
  message: "El cliente ha respondido"
})
```

## Configuración

### Variables de Entorno
```bash
# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Permisos de Navegador
- **Chrome/Edge**: Permite notificaciones del sitio
- **Firefox**: Permite notificaciones del sitio
- **Safari**: Requiere configuración adicional

## Estados de Notificación

| Estado | Descripción | Color |
|--------|-------------|-------|
| Activas | Permisos concedidos | Verde |
| Denegadas | Permisos rechazados | Rojo |
| No Soportadas | Navegador no compatible | Gris |

## Flujo Completo

1. **Técnico**: Hace clic en "Solicitar Control"
2. **Sistema**: Verifica permisos de notificación
3. **Sistema**: Envía notificación al cliente
4. **Cliente**: Recibe notificación emergente
5. **Cliente**: Acepta o rechaza la solicitud
6. **Sistema**: Notifica al técnico del resultado
7. **Sistema**: Habilita/deshabilita control según respuesta

## Troubleshooting

### Notificaciones No Aparecen
- Verificar permisos del navegador
- Comprobar que el sitio esté en HTTPS (requerido)
- Revisar consola del navegador para errores

### Permisos Denegados
- Ir a Configuración del sitio
- Habilitar notificaciones manualmente
- Recargar la página

### Error de Conexión
- Verificar que ambos ordenadores estén en la misma sala
- Comprobar conexión a internet
- Revisar logs del servidor

## Desarrollo

### Agregar Nuevos Tipos de Notificación
```javascript
// En hooks/use-push-notifications.ts
const sendRemoteNotification = async (
  roomId: string,
  type: "control_request" | "control_accepted" | "control_rejected" | "new_type",
  message: string
) => {
  // Lógica de envío
}
```

### Personalizar Notificaciones
```javascript
// En components/ui/notification.tsx
const getIcon = () => {
  switch (type) {
    case "success":
      return <Check className="h-5 w-5 text-green-600" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    // Agregar nuevos tipos aquí
  }
}
```

## Seguridad

- ✅ Confirmación explícita requerida
- ✅ Tiempo límite de respuesta
- ✅ Permisos de navegador verificados
- ✅ Notificaciones solo entre salas válidas
- ✅ Logs de todas las acciones

## Soporte

Para problemas técnicos, contactar:
- **WhatsApp**: +57 305 289 1719
- **Desarrollador**: Armando Ovalle
- **Mensaje**: "hola necesito ayuda con notificaciones" 