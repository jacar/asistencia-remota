import { Link } from "react-router-dom"
import { Monitor } from "lucide-react"

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Monitor className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">RemoteConnect</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link to="/demo" className="text-gray-600 hover:text-gray-900 transition-colors">
              Demo
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center space-x-4">
            <Link to="/demo" className="btn-primary">
              Try Demo
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
