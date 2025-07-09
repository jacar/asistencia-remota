# 🚀 RemoteConnect - Open Source Remote Desktop

A modern, web-based remote desktop solution built with React, Node.js, and WebRTC. No downloads required!

## ✨ Features

- 🖥️ **Remote Desktop Control** - Full mouse and keyboard control
- 📺 **Screen Sharing** - Real-time screen sharing with WebRTC
- 💬 **Live Chat** - Built-in messaging during sessions
- 📁 **File Transfer** - Drag & drop file sharing
- 👥 **Multi-User Sessions** - Multiple participants support
- 🔐 **Secure** - End-to-end encrypted connections
- 🌐 **Cross-Platform** - Works in any modern browser

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/remoteconnect.git
   cd remoteconnect
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm run setup
   \`\`\`

3. **Start development servers**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## 🛠️ Development

### Project Structure

\`\`\`
remoteconnect/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package.json
└── README.md
\`\`\`

### Available Scripts

\`\`\`bash
# Development
npm run dev              # Start both client and server
npm run client:dev       # Start only client
npm run server:dev       # Start only server

# Production
npm run build           # Build client for production
npm start              # Start production server

# Database (when using full version)
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
\`\`\`

## 🌐 Demo

Try the live demo at: [https://remoteconnect-demo.vercel.app](https://remoteconnect-demo.vercel.app)

Or run locally:
1. Start the development servers: `npm run dev`
2. Open http://localhost:5173/demo
3. Create a session or join with a session ID

## 🔧 Configuration

### Environment Variables

Create `.env` files in the server directory:

\`\`\`env
# server/.env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
\`\`\`

## 📖 API Documentation

### Health Check
\`\`\`
GET /api/health
\`\`\`

### Demo API
\`\`\`
GET /api/demo
\`\`\`

### Socket.io Events

- `join-room` - Join a session room
- `offer/answer/ice-candidate` - WebRTC signaling
- `chat-message` - Send chat messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- WebRTC community for excellent documentation
- Socket.io team for real-time communication
- React team for the fantastic framework

## 📞 Support

- Issues: [GitHub Issues](https://github.com/yourusername/remoteconnect/issues)
- Email: support@remoteconnect.dev

---

**Built with ❤️ by the RemoteConnect team**
\`\`\`

```plaintext file="server/.env.example"
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Origins
CORS_ORIGIN=http://localhost:5173

# Optional: Database (for full version)
# DATABASE_URL=postgresql://username:password@localhost:5432/remoteconnect

# Optional: JWT Secret (for authentication)
# JWT_SECRET=your-super-secret-jwt-key-here

```

# 🚀 Asistencia Remota

## Levantar el proyecto con Docker Compose

1. Clona el repositorio:
   ```sh
   git clone https://github.com/jacar/asistencia-remota.git
   cd asistencia-remota
   ```

2. Construye y levanta los servicios:
   ```sh
   docker-compose up --build
   ```

3. Accede a las aplicaciones:
   - **Frontend:** [http://localhost:5174](http://localhost:5174)
   - **Backend:** [http://localhost:3000](http://localhost:3000)

---

Si tienes algún problema con los puertos, asegúrate de que no estén siendo usados por otros procesos.

¿Dudas o problemas? Abre un issue en el repositorio.

```
