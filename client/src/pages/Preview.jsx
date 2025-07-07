"use client"

import { useState, useEffect } from "react"
import { Monitor, Play, Code, Globe, Github, ExternalLink } from "lucide-react"
import StatusIndicator from "../components/preview/StatusIndicator"

const Preview = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const quickLinks = [
    { name: "Home Page", url: "/", icon: Globe, description: "Main landing page" },
    { name: "Demo", url: "/demo", icon: Play, description: "Interactive demo" },
    {
      name: "API Health",
      url: "http://localhost:3001/api/health",
      icon: Code,
      description: "Backend status",
      external: true,
    },
    { name: "GitHub", url: "https://github.com", icon: Github, description: "Source code", external: true },
  ]

  const features = [
    { name: "Real-time Sessions", status: "Ready", description: "Create and join sessions with room codes" },
    { name: "Live Chat", status: "Ready", description: "WebSocket-based messaging" },
    { name: "Responsive UI", status: "Ready", description: "Mobile and desktop optimized" },
    { name: "WebRTC Foundation", status: "Ready", description: "Prepared for video streaming" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Monitor className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">RemoteConnect Preview</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Open Source Remote Desktop Solution</p>
          <p className="text-sm text-gray-500">Preview started at {currentTime.toLocaleString()}</p>
        </div>

        {/* Status Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Server Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Server Status</h2>
            <div className="space-y-3">
              <StatusIndicator url="http://localhost:5173" label="Frontend Server" type="http" />
              <StatusIndicator url="http://localhost:3001/api/health" label="Backend API" type="http" />
              <StatusIndicator
                url="ws://localhost:3001/socket.io/?EIO=4&transport=websocket"
                label="WebSocket Server"
                type="websocket"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Links</h2>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <a
                  key={`link-${index}-${link.name}`}
                  href={link.url}
                  target={link.external ? "_blank" : "_self"}
                  rel={link.external ? "noopener noreferrer" : ""}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <link.icon className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{link.name}</p>
                      <p className="text-sm text-gray-500">{link.description}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Features Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">✨ Features Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={`feature-${index}-${feature.name}`} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{feature.name}</p>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {feature.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎮 Demo Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">👑 As Host:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>
                  Go to{" "}
                  <a href="/demo" className="text-blue-600 hover:underline">
                    /demo
                  </a>
                </li>
                <li>Click "Create Session"</li>
                <li>Copy the room code (e.g., "ABC123")</li>
                <li>Share code with others</li>
                <li>Start chatting!</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">👤 As Guest:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Open new browser tab</li>
                <li>
                  Go to{" "}
                  <a href="/demo" className="text-blue-600 hover:underline">
                    /demo
                  </a>
                </li>
                <li>Enter the room code</li>
                <li>Click "Join Session"</li>
                <li>Chat with the host!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Technical Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React 18</li>
                <li>• Vite dev server</li>
                <li>• Tailwind CSS</li>
                <li>• Socket.io client</li>
                <li>• React Router</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Node.js + Express</li>
                <li>• Socket.io server</li>
                <li>• CORS enabled</li>
                <li>• Rate limiting</li>
                <li>• Health monitoring</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time messaging</li>
                <li>• Room management</li>
                <li>• Connection status</li>
                <li>• Responsive design</li>
                <li>• Error handling</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Built with ❤️ using React, Node.js, Socket.io & WebRTC</p>
          <p className="text-sm mt-1">Open source under MIT License</p>
        </div>
      </div>
    </div>
  )
}

export default Preview
