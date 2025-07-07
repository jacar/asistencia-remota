"use client"

const Message = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
          isOwn ? "bg-primary-600 text-white" : "bg-gray-700 text-gray-100"
        }`}
      >
        {!isOwn && <div className="text-xs text-gray-300 mb-1 font-medium">{message.sender.username}</div>}

        <div className="text-sm break-words">{message.content}</div>

        <div className={`text-xs mt-1 ${isOwn ? "text-primary-200" : "text-gray-400"}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}

export default Message
