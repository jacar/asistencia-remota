const fetch = require('node-fetch');

async function testNotifications() {
  console.log('🧪 Testing notification system...\n');
  
  const roomId = 'TEST123';
  const baseUrl = 'http://localhost:3003'; // Puerto actual del servidor
  
  try {
    // 1. Enviar solicitud de control
    console.log('📤 Sending control request...');
    const controlRequest = await fetch(`${baseUrl}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        type: 'control_request',
        message: 'El técnico está solicitando acceso para controlar tu computadora',
        sender: 'host'
      })
    });
    
    if (controlRequest.ok) {
      console.log('✅ Control request sent successfully');
    } else {
      console.log('❌ Failed to send control request:', controlRequest.status);
    }
    
    // 2. Verificar notificaciones
    console.log('\n📨 Checking notifications...');
    const notificationsResponse = await fetch(`${baseUrl}/api/notifications?roomId=${roomId}`);
    
    if (notificationsResponse.ok) {
      const data = await notificationsResponse.json();
      console.log('✅ Notifications retrieved:', data);
      console.log(`📊 Found ${data.notifications?.length || 0} notifications`);
    } else {
      console.log('❌ Failed to get notifications:', notificationsResponse.status);
    }
    
    // 3. Enviar aceptación
    console.log('\n✅ Sending acceptance...');
    const acceptanceResponse = await fetch(`${baseUrl}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        type: 'control_accepted',
        message: 'El cliente ha aceptado tu solicitud de control remoto',
        sender: 'client'
      })
    });
    
    if (acceptanceResponse.ok) {
      console.log('✅ Acceptance sent successfully');
    } else {
      console.log('❌ Failed to send acceptance:', acceptanceResponse.status);
    }
    
    // 4. Verificar notificaciones finales
    console.log('\n📨 Checking final notifications...');
    const finalNotificationsResponse = await fetch(`${baseUrl}/api/notifications?roomId=${roomId}`);
    
    if (finalNotificationsResponse.ok) {
      const finalData = await finalNotificationsResponse.json();
      console.log('✅ Final notifications:', finalData);
      console.log(`📊 Total notifications: ${finalData.notifications?.length || 0}`);
    } else {
      console.log('❌ Failed to get final notifications:', finalNotificationsResponse.status);
    }
    
    console.log('\n🎉 Notification test completed!');
    
  } catch (error) {
    console.error('❌ Error during notification test:', error);
  }
}

// Ejecutar la prueba
testNotifications(); 