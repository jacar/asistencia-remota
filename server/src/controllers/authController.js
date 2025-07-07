const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { email, username, password } = req.body

      // Validation
      if (!email || !username || !password) {
        return res.status(400).json({
          error: "Email, username, and password are required",
        })
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters long",
        })
      }

      // Check if user already exists
      const existingUser = await req.prisma.user.findFirst({
        where: {
          OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
        },
      })

      if (existingUser) {
        return res.status(409).json({
          error: "User with this email or username already exists",
        })
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Create user
      const user = await req.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          isOnline: true,
        },
      })

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.status(201).json({
        message: "User registered successfully",
        user,
        token,
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          error: "Email and password are required",
        })
      }

      // Find user
      const user = await req.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Update user online status
      await req.prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true },
      })

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isOnline: true,
          createdAt: user.createdAt,
        },
        token,
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      const userId = req.user.userId

      // Update user offline status
      await req.prisma.user.update({
        where: { id: userId },
        data: { isOnline: false },
      })

      res.json({ message: "Logout successful" })
    } catch (error) {
      console.error("Logout error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId

      const user = await req.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          isOnline: true,
          createdAt: true,
          _count: {
            select: {
              hostSessions: true,
              guestSessions: true,
            },
          },
        },
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json({ user })
    } catch (error) {
      console.error("Get profile error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId
      const { username } = req.body

      if (!username) {
        return res.status(400).json({ error: "Username is required" })
      }

      // Check if username is already taken
      const existingUser = await req.prisma.user.findFirst({
        where: {
          username: username.toLowerCase(),
          NOT: { id: userId },
        },
      })

      if (existingUser) {
        return res.status(409).json({ error: "Username already taken" })
      }

      // Update user
      const updatedUser = await req.prisma.user.update({
        where: { id: userId },
        data: { username: username.toLowerCase() },
        select: {
          id: true,
          email: true,
          username: true,
          isOnline: true,
          createdAt: true,
        },
      })

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
}

module.exports = AuthController
