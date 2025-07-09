import { useState } from "react"

export default function ChatBox({ messages, sendMessage }) {
  const [input, setInput] = useState("")

  const handleSend = (e) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput("")
    }
  }

  return (
    <div className="border rounded p-2 flex flex-col h-64 bg-white">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-1">
            <span className="font-bold">{msg.sender}: </span>
            <span>{msg.message}</span>
            <span className="text-xs text-gray-400 ml-2">{msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button className="ml-2 px-3 py-1 bg-blue-500 text-white rounded" type="submit">
          Enviar
        </button>
      </form>
    </div>
  )
} 