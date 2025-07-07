"use client"
import { Monitor, Users, Copy, ExternalLink, Clock } from "lucide-react"

const SessionCard = ({ session, onCopyCode, onJoin }) => {
  const isHost = session.host.id === session.hostId
  const otherUser = isHost ? session.guest : session.host

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">{isHost ? "Hosting" : "Joined"}</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
      </div>

      <div className="card-content">
        <div className="space-y-3">
          {/* Session Code */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Session Code</p>
            <div className="flex items-center justify-between bg-gray-50 rounded-md p-2">
              <span className="font-mono text-lg font-bold text-gray-900">{session.sessionCode}</span>
              <button
                onClick={onCopyCode}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy code"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Participants */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Participants</p>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {session.host.username}
                {session.guest && ` • ${session.guest.username}`}
                {!session.guest && " • Waiting for guest..."}
              </span>
            </div>
          </div>

          {/* Session Info */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Started {new Date(session.startedAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Permissions */}
          <div className="flex flex-wrap gap-1">
            {session.allowControl && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Control
              </span>
            )}
            {session.allowFileTransfer && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Files
              </span>
            )}
            {session.allowChat && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Chat
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button onClick={onJoin} className="w-full btn-primary flex items-center justify-center space-x-2">
              <ExternalLink className="h-4 w-4" />
              <span>Join Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionCard
