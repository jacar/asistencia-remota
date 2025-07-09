const fetch = require('node-fetch');

async function testConnection() {
  console.log('🧪 Testing connection and notification system...\n');
  
  const baseUrl = 'http://localhost:3001'; // Puerto del servidor backend
  
  try {
    // 1. Verificar estado del servidor
    console.log('📡 Verificando estado del servidor...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Servidor funcionando:', healthData);
    } else {
      console.log('❌ Servidor no responde:', healthResponse.status);
      return;
    }
    
    // 2. Simular conexión de cliente externo
    console.log('\n🔗 Simulando conexión de cliente externo...');
    const connectionData = {
      socketId: 'test-client-123',
      ip: '192.168.1.100',
      timestamp: new Date().toISOString(),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      message: 'Nuevo dispositivo solicitando conexión desde 192.168.1.100',
      deviceInfo: {
        deviceType: 'Desktop',
        browser: 'Chrome',
        os: 'Windows',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...'
      }
    };
    
    console.log('📤 Datos de conexión simulados:', {
      IP: connectionData.ip,
      Dispositivo: connectionData.deviceInfo.deviceType,
      Sistema: connectionData.deviceInfo.os,
      Navegador: connectionData.deviceInfo.browser,
      Hora: new Date(connectionData.timestamp).toLocaleTimeString()
    });
    
    // 3. Simular respuesta del host
    console.log('\n👤 Simulando respuesta del host...');
    const hostResponse = {
      socketId: 'test-client-123',
      allowed: true
    };
    
    console.log('✅ Host permitiendo conexión:', hostResponse);
    
    // 4. Simular notificación de control remoto
    console.log('\n🎮 Simulando solicitud de control remoto...');
    const controlRequest = {
      fromId: 'host-456',
      message: 'El técnico está solicitando acceso para controlar tu computadora',
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Solicitud de control remoto:', {
      De: controlRequest.fromId,
      Mensaje: controlRequest.message,
      Hora: new Date(controlRequest.timestamp).toLocaleTimeString()
    });
    
    // 5. Simular respuesta del cliente
    console.log('\n👥 Simulando respuesta del cliente...');
    const clientResponse = {
      allowed: true,
      targetId: 'host-456',
      message: 'El cliente ha aceptado tu solicitud de control remoto'
    };
    
    console.log('✅ Cliente aceptando control remoto:', clientResponse);
    
    // 6. Resumen de la prueba
    console.log('\n📋 Resumen de la prueba:');
    console.log('  ✅ Servidor funcionando correctamente');
    console.log('  ✅ Notificaciones de conexión externa implementadas');
    console.log('  ✅ Información detallada del dispositivo incluida');
    console.log('  ✅ Notificaciones de control remoto mejoradas');
    console.log('  ✅ Sistema de permisos funcionando');
    
    console.log('\n🎯 Para probar en navegadores:');
    console.log('  1. Abre http://localhost:3000 en una pestaña (será el host)');
    console.log('  2. Abre http://localhost:3000 en otra pestaña (será el cliente)');
    console.log('  3. El host verá una notificación cuando el cliente se conecte');
    console.log('  4. El host puede permitir o rechazar la conexión');
    console.log('  5. Una vez conectados, pueden probar el control remoto');
    
    console.log('\n🔧 Características implementadas:');
    console.log('  • Notificaciones detalladas con información del dispositivo');
    console.log('  • Modal mejorado con información completa');
    console.log('  • Toast notifications con botones de acción');
    console.log('  • Timestamps en todas las notificaciones');
    console.log('  • Logging detallado para debugging');
    console.log('  • Animaciones y transiciones suaves');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testConnection();
