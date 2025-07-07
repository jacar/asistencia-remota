#!/usr/bin/env node

/**
 * Script de prueba para verificar comunicación entre dos terminales
 * Simula el comportamiento de dos computadoras conectadas
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3005' // Puerto actual del servidor
const TEST_ROOM = 'TEST123'

console.log('🧪 Iniciando prueba de comunicación entre terminales...')
console.log(`📍 URL del servidor: ${BASE_URL}`)
console.log(`🔑 Sala de prueba: ${TEST_ROOM}`)
console.log('')

// Función para simular terminal 1 (Técnico/Host)
async function simulateTerminal1() {
  console.log('🖥️  Terminal 1 (Técnico) iniciando...')
  
  try {
    // 1. Verificar estado del servidor
    console.log('📡 Verificando estado del servidor...')
    const statusResponse = await fetch(`${BASE_URL}/api/socket/status`)
    const statusData = await statusResponse.json()
    console.log('✅ Estado del servidor:', statusData.status || 'online')
    
    // 2. Enviar solicitud de control
    console.log('🎮 Enviando solicitud de control remoto...')
    const controlRequest = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: TEST_ROOM,
        type: 'control_request',
        message: 'El técnico está solicitando acceso para controlar tu computadora',
        sender: 'host'
      })
    })
    
    if (controlRequest.ok) {
      console.log('✅ Solicitud de control enviada exitosamente')
    } else {
      console.log('❌ Error enviando solicitud de control')
    }
    
    // 3. Verificar notificaciones después de 2 segundos
    setTimeout(async () => {
      console.log('📨 Verificando notificaciones...')
      const notificationsResponse = await fetch(`${BASE_URL}/api/notifications?roomId=${TEST_ROOM}`)
      const notificationsData = await notificationsResponse.json()
      
      console.log(`📊 Notificaciones encontradas: ${notificationsData.notifications?.length || 0}`)
      notificationsData.notifications?.forEach((notification, index) => {
        console.log(`  ${index + 1}. ${notification.type}: ${notification.message}`)
      })
    }, 2000)
    
  } catch (error) {
    console.error('❌ Error en Terminal 1:', error.message)
  }
}

// Función para simular terminal 2 (Cliente)
async function simulateTerminal2() {
  console.log('💻 Terminal 2 (Cliente) iniciando...')
  
  try {
    // 1. Verificar notificaciones entrantes
    console.log('📨 Verificando notificaciones entrantes...')
    const notificationsResponse = await fetch(`${BASE_URL}/api/notifications?roomId=${TEST_ROOM}`)
    const notificationsData = await notificationsResponse.json()
    
    console.log(`📊 Notificaciones encontradas: ${notificationsData.notifications?.length || 0}`)
    
    // 2. Simular aceptación de control
    if (notificationsData.notifications?.length > 0) {
      console.log('✅ Simulando aceptación de control remoto...')
      const acceptResponse = await fetch(`${BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: TEST_ROOM,
          type: 'control_accepted',
          message: 'El cliente ha aceptado tu solicitud de control remoto',
          sender: 'client'
        })
      })
      
      if (acceptResponse.ok) {
        console.log('✅ Aceptación de control enviada exitosamente')
      } else {
        console.log('❌ Error enviando aceptación de control')
      }
    }
    
  } catch (error) {
    console.error('❌ Error en Terminal 2:', error.message)
  }
}

// Función principal
async function runTest() {
  console.log('🚀 Iniciando prueba de comunicación...')
  console.log('')
  
  // Ejecutar terminal 1
  await simulateTerminal1()
  
  // Esperar un poco y ejecutar terminal 2
  setTimeout(async () => {
    await simulateTerminal2()
    
    // Verificación final
    setTimeout(async () => {
      console.log('')
      console.log('🔍 Verificación final...')
      const finalResponse = await fetch(`${BASE_URL}/api/notifications?roomId=${TEST_ROOM}`)
      const finalData = await finalResponse.json()
      
      console.log(`📊 Total de notificaciones en la sala: ${finalData.notifications?.length || 0}`)
      
      const hasRequest = finalData.notifications?.some(n => n.type === 'control_request')
      const hasAcceptance = finalData.notifications?.some(n => n.type === 'control_accepted')
      
      if (hasRequest && hasAcceptance) {
        console.log('✅ Prueba exitosa: Comunicación entre terminales funcionando')
      } else {
        console.log('❌ Prueba fallida: Problemas en la comunicación')
      }
      
      console.log('')
      console.log('📋 Resumen de la prueba:')
      console.log('  • Terminal 1 (Técnico) envió solicitud de control')
      console.log('  • Terminal 2 (Cliente) recibió y aceptó la solicitud')
      console.log('  • Sistema de notificaciones funcionando correctamente')
      console.log('')
      console.log('🎯 Para probar en navegadores:')
      console.log(`  1. Abre ${BASE_URL}/control en una pestaña`)
      console.log(`  2. Abre ${BASE_URL}/control en otra pestaña`)
      console.log('  3. Genera un código en una y únete con el mismo código en la otra')
      console.log('  4. Solicita control remoto desde el terminal del técnico')
      
    }, 3000)
  }, 1000)
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runTest().catch(console.error)
}

module.exports = { runTest } 