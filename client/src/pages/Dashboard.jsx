"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Monitor, Users } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useSessionStore } from "../store/sessionStore"
import SessionCard from "../components/dashboard/SessionCard"
import toast from "react-hot-toast"

const Dashboard = () => {
  const { user } = useAuthStore()
  const { sessions, createSession, joinSession, getUserSessions, isLoading } = useSessionStore()
  const [joinCode, setJoinCode] = useState("")
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sessionSettings, setSessionSettings] = useState({
    allowControl: true,
    allowFileTransfer: true,
    allowChat: true,
  })
  const navigate = useNavigate()

  useEffect(() => {
    getUserSessions()
  }, [getUserSessions])

  const handleCreateSession = async () => {
    try {
      const session = await createSession(sessionSettings)
      toast.success("Session created successfully!")
      setShowCreateModal(false)
      navigate(`/session/${session.id}`)
    } catch (error) {
      toast.error(error.message || "Failed to create session")
    }
  }

  const handleJoinSession = async () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a session code")
      return
    }

    try {
      const session = await joinSession(joinCode.trim().toUpperCase())
      toast.success("Joined session successfully!")
      setShowJoinModal(false)
      setJoinCode("")
      navigate(`/session/${session.id}`)
    } catch (error) {
      toast.error(error.message || "Failed to join session")
    }
  }

  const copySessionCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success("Session code copied to clipboard!")
  }

  const activeSessions = sessions.filter((session) => session.isActive)
  const recentSessions = sessions.filter((session) => !session.isActive).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
          <p className="mt-2 text-gray-600">Manage your remote desktop sessions and connect with others.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Start New Session</h3>
              <p className="text-sm text-gray-500">Create a new remote desktop session</p>
            </div>
            <div className="card-content">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Session</span>
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Join Session</h3>
              <p className="text-sm text-gray-500">Enter a session code to join</p>
            </div>
            <div className="card-content">
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Users className="h-5 w-5" />
                <span>Join Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onCopyCode={() => copySessionCode(session.sessionCode)}
                  onJoin={() => navigate(`/session/${session.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sessions</h2>
            <div className="card">
              <div className="card-content">
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Monitor className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Session with{" "}
                            {session.host.username === user?.username
                              ? session.guest?.username || "Guest"
                              : session.host.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.startedAt).toLocaleDateString()} • {session.sessionCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Ended
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sessions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Monitor className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first remote desktop session.</p>
            <div className="mt-6">
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                <Plus className="h-5 w-5 mr-2" />
                Create Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Session</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="allowControl"
                    type="checkbox"
                    checked={sessionSettings.allowControl}
                    onChange={(e) =>
                      setSessionSettings({
                        ...sessionSettings,
                        allowControl: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowControl" className="ml-2 block text-sm text-gray-900">
                    Allow remote control
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="allowFileTransfer"
                    type="checkbox"
                    checked={sessionSettings.allowFileTransfer}
                    onChange={(e) =>
                      setSessionSettings({
                        ...sessionSettings,
                        allowFileTransfer: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowFileTransfer" className="ml-2 block text-sm text-gray-900">
                    Allow file transfer
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="allowChat"
                    type="checkbox"
                    checked={sessionSettings.allowChat}
                    onChange={(e) =>
                      setSessionSettings({
                        ...sessionSettings,
                        allowChat: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowChat" className="ml-2 block text-sm text-gray-900">
                    Allow chat
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleCreateSession} className="btn-primary">
                  Create Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Join Session</h3>

              <div className="mb-4">
                <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Session Code
                </label>
                <input
                  id="joinCode"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="input font-mono text-center text-lg tracking-wider"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowJoinModal(false)
                    setJoinCode("")
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleJoinSession} className="btn-primary">
                  Join Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
