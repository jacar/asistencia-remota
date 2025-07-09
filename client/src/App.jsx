import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Layout from "./components/common/Layout"
import Home from "./pages/Home"
import Demo from "./pages/Demo"
import Preview from "./pages/Preview"
import NotFound from "./pages/NotFound"
import { useEffect, useState } from "react"
import { socketService } from "./services/socket"
import toast from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../../components/ui/alert-dialog"

function App() {
  const [externalRequest, setExternalRequest] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    // Conectar socket al cargar la app (solo para host)
    socketService.connect()
    
    // Escuchar notificación de conexión externa
    socketService.on("external-connection-request", (data) => {
      console.log("🔔 Nueva solicitud de conexión externa:", data)
      setExternalRequest(data)
      setModalOpen(true)
      
      // Mostrar toast de notificación adicional
      toast((t) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🔗</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Nueva Conexión Solicitada
            </p>
            <p className="text-xs text-gray-500 mt-1">
              IP: {data.ip} • {data.deviceInfo?.deviceType} • {data.deviceInfo?.os}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {data.deviceInfo?.browser} • {new Date(data.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => {
                handlePermission(true)
                toast.dismiss(t.id)
              }}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
            >
              Permitir
            </button>
          </div>
        </div>
      ), {
        duration: 15000,
        position: "top-right",
        style: {
          minWidth: "320px",
          padding: "12px",
        },
      })
    })
    
    // Limpiar listener al desmontar
    return () => {
      socketService.off("external-connection-request")
    }
  }, [])

  const handlePermission = (allowed) => {
    if (externalRequest) {
      console.log(`${allowed ? '✅' : '❌'} ${allowed ? 'Permitiendo' : 'Rechazando'} conexión de ${externalRequest.ip}`)
      
      socketService.emit("external-connection-response", {
        socketId: externalRequest.socketId,
        allowed,
      })
      
      // Mostrar confirmación
      toast.success(
        allowed 
          ? `✅ Conexión permitida para ${externalRequest.ip}`
          : `❌ Conexión rechazada para ${externalRequest.ip}`,
        {
          duration: 3000,
          position: "top-right",
        }
      )
      
      setModalOpen(false)
      setExternalRequest(null)
    }
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/demo"
            element={
              <Layout>
                <Demo />
              </Layout>
            }
          />
          <Route path="/preview" element={<Preview />} />
          <Route
            path="*"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
        
        {/* Modal mejorado de permiso para nuevas conexiones externas */}
        <AlertDialog open={modalOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <span className="text-blue-500">🔗</span>
                <span>Nueva Conexión Solicitada</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Dispositivo solicitando acceso:
                  </p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>IP:</span>
                      <span className="font-mono">{externalRequest?.ip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dispositivo:</span>
                      <span>{externalRequest?.deviceInfo?.deviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sistema:</span>
                      <span>{externalRequest?.deviceInfo?.os}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Navegador:</span>
                      <span>{externalRequest?.deviceInfo?.browser}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hora:</span>
                      <span>{externalRequest?.timestamp ? new Date(externalRequest.timestamp).toLocaleTimeString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  ¿Deseas permitir que este dispositivo se conecte a tu terminal?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => handlePermission(false)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Rechazar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handlePermission(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Permitir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Router>
  )
}

export default App
