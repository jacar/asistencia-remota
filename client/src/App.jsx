import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Layout from "./components/common/Layout"
import Home from "./pages/Home"
import Demo from "./pages/Demo"
import Preview from "./pages/Preview"
import NotFound from "./pages/NotFound"
import { useEffect, useState } from "react"
import { socketService } from "./services/socket"
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
      setExternalRequest(data)
      setModalOpen(true)
    })
    // Limpiar listener al desmontar
    return () => {
      socketService.off("external-connection-request")
    }
  }, [])

  const handlePermission = (allowed) => {
    if (externalRequest) {
      socketService.emit("external-connection-response", {
        socketId: externalRequest.socketId,
        allowed,
      })
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
        {/* Modal de permiso para nuevas conexiones externas */}
        <AlertDialog open={modalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Permitir nueva conexión externa</AlertDialogTitle>
              <AlertDialogDescription>
                Un nuevo dispositivo con IP <b>{externalRequest?.ip}</b> solicita conectarse. ¿Deseas permitirlo?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handlePermission(false)}>
                Rechazar
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => handlePermission(true)}>
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
