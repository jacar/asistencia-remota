import { Monitor, Github, Mail } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Monitor className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">RemoteConnect</span>
            </div>
            <p className="text-gray-600 mb-4">
              Open source remote desktop solution built with modern web technologies. Secure, fast, and reliable remote
              access for everyone.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@remoteconnect.com"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600">Remote Desktop Control</span>
              </li>
              <li>
                <span className="text-gray-600">Screen Sharing</span>
              </li>
              <li>
                <span className="text-gray-600">File Transfer</span>
              </li>
              <li>
                <span className="text-gray-600">Live Chat</span>
              </li>
              <li>
                <span className="text-gray-600">Multi-user Sessions</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600">Documentation</span>
              </li>
              <li>
                <span className="text-gray-600">API Reference</span>
              </li>
              <li>
                <span className="text-gray-600">Community</span>
              </li>
              <li>
                <span className="text-gray-600">Bug Reports</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2024 RemoteConnect. Open source under MIT License.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-gray-500 text-sm">Privacy Policy</span>
              <span className="text-gray-500 text-sm">Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
