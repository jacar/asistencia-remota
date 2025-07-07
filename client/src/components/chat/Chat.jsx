"use client"

import { useState, useEffect, useRef } from "react"
import { Send, MessageCircle } from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import Message from "./Message"

const Chat = ({ sessionId, socket }) => {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (socket) {
      // Listen for chat messages
      socket.on("chat-message", (message) => {
        setMessages((prev) => [...prev, message])
      })

      // Listen for typing indicators
      socket.on("user-typing", (data) => {
        if (data.userId !== user?.id) {
          setIsTyping(true)
          setTimeout(() => setIsTyping(false), 3000)
        }
      })

      return () => {
        socket.off("chat-message")
        socket.off("user-typing")
      }
    }
  }, [socket, user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !socket) return

    socket.emit("chat-message", {
      sessionId,
      message: newMessage.trim(),
    })

    setNewMessage("")
    inputRef.current?.focus()
  }

  const handleTyping = () => {
    if (socket) {
      socket.emit("user-typing", { sessionId, userId: user?.id })
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-primary-400" />
          <span className="font-medium">Chat</span>
          <span className="text-sm text-gray-400">({messages.length})</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} isOwn={message.sender.id === user?.id} />
          ))
        )}

        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            <span>Someone is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleTyping}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-2 text-xs text-gray-500 text-right">{newMessage.length}/500</div>
      </div>
    </div>
  )
}

export default Chat
