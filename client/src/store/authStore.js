import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authAPI } from "../services/api"
import toast from "react-hot-toast"

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authAPI.login(email, password)
          const { user, token } = response.data

          // Store in localStorage
          localStorage.setItem("auth_token", token)
          localStorage.setItem("auth_user", JSON.stringify(user))

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return { user, token }
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Login failed"
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          throw new Error(errorMessage)
        }
      },

      register: async (email, username, password) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authAPI.register(email, username, password)
          const { user, token } = response.data

          // Store in localStorage
          localStorage.setItem("auth_token", token)
          localStorage.setItem("auth_user", JSON.stringify(user))

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return { user, token }
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Registration failed"
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          throw new Error(errorMessage)
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          await authAPI.logout()
        } catch (error) {
          console.error("Logout error:", error)
        } finally {
          // Clear localStorage
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authAPI.updateProfile(profileData)
          const { user } = response.data

          // Update localStorage
          localStorage.setItem("auth_user", JSON.stringify(user))

          set({
            user,
            isLoading: false,
            error: null,
          })

          toast.success("Profile updated successfully")
          return user
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Profile update failed"
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw new Error(errorMessage)
        }
      },

      refreshToken: async () => {
        const { token } = get()
        if (!token) return

        try {
          const response = await authAPI.getProfile()
          const { user } = response.data

          // Update user data
          localStorage.setItem("auth_user", JSON.stringify(user))
          set({ user })
        } catch (error) {
          console.error("Token refresh failed:", error)
          // If refresh fails, logout user
          get().logout()
        }
      },

      checkAuthStatus: () => {
        set({ isLoading: true })

        try {
          const token = localStorage.getItem("auth_token")
          const userStr = localStorage.getItem("auth_user")

          if (token && userStr) {
            const user = JSON.parse(userStr)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error("Auth check failed:", error)
          // Clear invalid data
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

export { useAuthStore }
