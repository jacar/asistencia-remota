// Script simple para probar notificaciones
const https = require('https');
const http = require('http');

async function testSimple() {
  console.log('🧪 Testing notifications with native Node.js...\n');
  
  const roomId = 'TEST123';
  const baseUrl = 'http://localhost:3003';
  
  try {
    // 1. Enviar solicitud de control
    console.log('📤 Sending control request...');
    const postData = JSON.stringify({
      roomId,
      type: 'control_request',
      message: 'El técnico está solicitando acceso para controlar tu computadora',
      sender: 'host'
    });
    
    const postOptions = {
      hostname: 'localhost',
      port: 3003,
      path: '/api/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const postReq = http.request(postOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Control request response:', res.statusCode);
        console.log('Response:', data);
        
        // 2. Verificar notificaciones
        console.log('\n📨 Checking notifications...');
        const getOptions = {
          hostname: 'localhost',
          port: 3003,
          path: `/api/notifications?roomId=${roomId}`,
          method: 'GET'
        };
        
        const getReq = http.request(getOptions, (getRes) => {
          let getData = '';
          getRes.on('data', (chunk) => {
            getData += chunk;
          });
          getRes.on('end', () => {
            console.log('✅ Notifications response:', getRes.statusCode);
            console.log('Notifications:', getData);
            
            // 3. Enviar aceptación
            console.log('\n✅ Sending acceptance...');
            const acceptData = JSON.stringify({
              roomId,
              type: 'control_accepted',
              message: 'El cliente ha aceptado tu solicitud de control remoto',
              sender: 'client'
            });
            
            const acceptOptions = {
              hostname: 'localhost',
              port: 3003,
              path: '/api/notifications',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(acceptData)
              }
            };
            
            const acceptReq = http.request(acceptOptions, (acceptRes) => {
              let acceptResponseData = '';
              acceptRes.on('data', (chunk) => {
                acceptResponseData += chunk;
              });
              acceptRes.on('end', () => {
                console.log('✅ Acceptance response:', acceptRes.statusCode);
                console.log('Acceptance response:', acceptResponseData);
                
                console.log('\n🎉 Test completed successfully!');
                console.log('\n📝 Next steps:');
                console.log('1. Open http://localhost:3003/control in your browser');
                console.log('2. Look for the "🧪 PROBAR Solicitar Control" button');
                console.log('3. Click it to test the notification system');
              });
            });
            
            acceptReq.on('error', (err) => {
              console.error('❌ Error sending acceptance:', err);
            });
            
            acceptReq.write(acceptData);
            acceptReq.end();
          });
        });
        
        getReq.on('error', (err) => {
          console.error('❌ Error getting notifications:', err);
        });
        
        getReq.end();
      });
    });
    
    postReq.on('error', (err) => {
      console.error('❌ Error sending control request:', err);
    });
    
    postReq.write(postData);
    postReq.end();
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Ejecutar la prueba
testSimple(); 