"use client"

import { useEffect } from "react"
import { useAuthStore } from "../store/authStore"

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    checkAuthStatus,
  } = useAuthStore()

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus()

    // Set up token refresh interval
    const refreshInterval = setInterval(
      () => {
        if (isAuthenticated && token) {
          refreshToken()
        }
      },
      15 * 60 * 1000,
    ) // Refresh every 15 minutes

    return () => clearInterval(refreshInterval)
  }, [isAuthenticated, token, checkAuthStatus, refreshToken])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  }
}
