"use client"

import { useState, useEffect, useRef } from "react"
import { Upload, Download, File, Trash2, AlertCircle, CheckCircle } from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { api } from "../../services/api"
import toast from "react-hot-toast"

const FileTransfer = ({ sessionId, socket }) => {
  const { user } = useAuthStore()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadFiles()
  }, [sessionId])

  useEffect(() => {
    if (socket) {
      // Listen for file transfer offers
      socket.on("file-transfer-offer", (data) => {
        const accept = window.confirm(
          `${data.fromUserId} wants to send you a file: ${data.fileName} (${formatFileSize(data.fileSize)}). Accept?`,
        )

        socket.emit("file-transfer-response", {
          sessionId,
          accepted: accept,
          targetUserId: data.fromUserId,
        })
      })

      socket.on("file-transfer-response", (data) => {
        if (data.accepted) {
          toast.success("File transfer accepted!")
        } else {
          toast.error("File transfer declined")
        }
      })

      return () => {
        socket.off("file-transfer-offer")
        socket.off("file-transfer-response")
      }
    }
  }, [socket, sessionId])

  const loadFiles = async () => {
    try {
      const response = await api.get(`/files/session/${sessionId}`)
      setFiles(response.data.files)
    } catch (error) {
      console.error("Failed to load files:", error)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileSelect = (selectedFiles) => {
    Array.from(selectedFiles).forEach((file) => {
      uploadFile(file)
    })
  }

  const uploadFile = async (file) => {
    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      toast.error("File size must be less than 50MB")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("sessionId", sessionId)

    try {
      const response = await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        },
      })

      setFiles((prev) => [response.data.file, ...prev])
      toast.success("File uploaded successfully!")

      // Notify other users about the file
      if (socket) {
        socket.emit("file-transfer-offer", {
          sessionId,
          fileName: file.name,
          fileSize: file.size,
          targetUserId: "all", // Notify all users in session
        })
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error(error.response?.data?.error || "Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const downloadFile = async (fileId, fileName) => {
    try {
      const response = await api.get(`/files/download/${fileId}`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("File downloaded successfully!")
    } catch (error) {
      console.error("Download failed:", error)
      toast.error("Download failed")
    }
  }

  const deleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return
    }

    try {
      await api.delete(`/files/${fileId}`)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
      toast.success("File deleted successfully!")
    } catch (error) {
      console.error("Delete failed:", error)
      toast.error("Delete failed")
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-primary-400" />
            <span className="font-medium">File Transfer</span>
            <span className="text-sm text-gray-400">({files.length})</span>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md text-sm font-medium transition-colors"
          >
            Upload
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`p-4 border-b border-gray-700 ${dragOver ? "bg-primary-900 bg-opacity-20" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver ? "border-primary-400 bg-primary-900 bg-opacity-10" : "border-gray-600 hover:border-gray-500"
          }`}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-400 mb-2">
            Drag and drop files here, or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary-400 hover:text-primary-300 underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-500">Maximum file size: 50MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="file-progress">
              <div className="file-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No files shared yet</p>
            <p className="text-xs">Upload files to share with other participants</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{file.originalName}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>by {file.uploader.username}</span>
                      <span>•</span>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadFile(file.id, file.originalName)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  {file.uploader.id === user?.id && (
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="text-xs text-gray-400">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle className="h-3 w-3 text-green-400" />
            <span>Files are shared with all session participants</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-3 w-3 text-yellow-400" />
            <span>Files are automatically deleted when the session ends</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileTransfer
