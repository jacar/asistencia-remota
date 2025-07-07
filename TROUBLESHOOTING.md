# Guía de Solución de Problemas - Sistema de Notificaciones

## 🔍 Problemas Comunes y Soluciones

### 1. Las notificaciones no llegan al otro ordenador

**Síntomas:**
- El técnico envía solicitud de control pero el cliente no recibe notificación
- No aparecen notificaciones en la interfaz

**Soluciones:**

#### A. Verificar que ambos ordenadores estén en la misma sala
1. Abre la consola del navegador (F12)
2. Verifica que ambos ordenadores tengan el mismo `roomId`
3. Asegúrate de que uno sea `isHost: true` y el otro `isHost: false`

#### B. Verificar la conectividad de red
1. Ambos ordenadores deben estar en la misma red local
2. Verifica que no haya firewall bloqueando las conexiones
3. Prueba acceder a `http://localhost:3004` desde ambos ordenadores

#### C. Verificar el estado del servidor
1. Abre la consola del navegador
2. Busca mensajes de error relacionados con `/api/notifications`
3. Verifica que el servidor esté corriendo en el puerto correcto

### 2. Notificaciones aparecen pero no se procesan

**Síntomas:**
- Las notificaciones se envían pero no aparecen en la interfaz
- No se muestran los botones de aceptar/rechazar

**Soluciones:**

#### A. Verificar el contexto de notificaciones
1. Asegúrate de que `NotificationProvider` esté envolviendo la aplicación
2. Verifica que `useNotificationContext` esté disponible

#### B. Verificar los roles correctos
1. El técnico (host) debe tener `isHost: true`
2. El cliente debe tener `isHost: false`
3. Solo el cliente debe recibir solicitudes de control
4. Solo el técnico debe recibir confirmaciones

### 3. Errores en la consola del navegador

**Síntomas:**
- Errores 404 en `/api/notifications`
- Errores de CORS
- Errores de red

**Soluciones:**

#### A. Verificar rutas de API
1. Asegúrate de que el archivo `app/api/notifications/route.ts` existe
2. Verifica que el servidor esté corriendo
3. Prueba acceder directamente a `http://localhost:3004/api/notifications`

#### B. Verificar configuración de Next.js
1. Asegúrate de que `next.config.mjs` esté configurado correctamente
2. Verifica que no haya conflictos de puertos

### 4. Polling muy frecuente

**Síntomas:**
- Muchas peticiones a `/api/notifications`
- Consumo alto de recursos

**Soluciones:**

#### A. Ajustar intervalo de polling
1. El intervalo actual es de 5 segundos
2. Se puede ajustar en `hooks/use-notification-listener.ts`
3. Recomendado: entre 3-10 segundos

### 5. Notificaciones duplicadas

**Síntomas:**
- La misma notificación aparece múltiples veces
- Botones de aceptar/rechazar aparecen repetidamente

**Soluciones:**

#### A. Verificar sistema de tracking
1. El sistema usa `processedNotifications` para evitar duplicados
2. Verifica que las notificaciones tengan IDs únicos
3. Reinicia la página si hay problemas persistentes

## 🛠️ Herramientas de Debug

### 1. Script de Prueba
```bash
node scripts/test-notifications.js
```

### 2. Verificar en Consola del Navegador
```javascript
// Verificar notificaciones manualmente
fetch('/api/notifications?roomId=TU_CODIGO_SALA')
  .then(r => r.json())
  .then(console.log)
```

### 3. Logs del Sistema
Busca estos mensajes en la consola:
- `🔍 Checking notifications for room:`
- `📨 Found X notifications for room`
- `🎯 Client received control request`
- `🎯 Host received control_accepted notification`

## 📋 Checklist de Verificación

### Antes de Probar:
- [ ] Servidor corriendo en puerto correcto
- [ ] Ambos ordenadores en la misma red
- [ ] Navegadores actualizados
- [ ] Consola del navegador abierta para debug

### Durante la Prueba:
- [ ] Generar código de sala en ordenador técnico
- [ ] Unirse a sala en ordenador cliente
- [ ] Verificar que ambos tengan el mismo roomId
- [ ] Hacer clic en "Solicitar Control Remoto"
- [ ] Verificar notificación en cliente
- [ ] Aceptar/rechazar en cliente
- [ ] Verificar confirmación en técnico

### Después de la Prueba:
- [ ] Verificar logs en consola
- [ ] Comprobar que no hay errores
- [ ] Verificar que las notificaciones se procesaron correctamente

## 🆘 Contacto de Soporte

Si los problemas persisten:
- **WhatsApp**: +57 305 289 1719
- **Desarrollador**: Armando Ovalle
- **Proyecto**: FULLASISTENTE

## 📝 Notas Técnicas

### Arquitectura del Sistema:
1. **API REST**: `/api/notifications` para enviar/recibir notificaciones
2. **Polling**: Verificación cada 5 segundos
3. **Context**: React Context para manejo de estado
4. **Roles**: Host (técnico) vs Client (usuario)

### Flujo de Notificaciones:
1. Técnico envía `control_request`
2. Cliente recibe notificación
3. Cliente acepta/rechaza
4. Técnico recibe confirmación
5. Control remoto se habilita si fue aceptado 