import { create } from "zustand"
import { sessionsAPI } from "../services/api"
import toast from "react-hot-toast"

const useSessionStore = create((set, get) => ({
  // State
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  // Actions
  createSession: async (settings) => {
    set({ isLoading: true, error: null })

    try {
      const response = await sessionsAPI.create(settings)
      const session = response.data.session

      set((state) => ({
        sessions: [session, ...state.sessions],
        currentSession: session,
        isLoading: false,
        error: null,
      }))

      return session
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to create session"
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw new Error(errorMessage)
    }
  },

  joinSession: async (sessionCode) => {
    set({ isLoading: true, error: null })

    try {
      const response = await sessionsAPI.join(sessionCode)
      const session = response.data.session

      set((state) => ({
        sessions: [session, ...state.sessions.filter((s) => s.id !== session.id)],
        currentSession: session,
        isLoading: false,
        error: null,
      }))

      return session
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to join session"
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw new Error(errorMessage)
    }
  },

  getUserSessions: async (params = {}) => {
    set({ isLoading: true, error: null })

    try {
      const response = await sessionsAPI.getUserSessions(params)
      const { sessions } = response.data

      set({
        sessions,
        isLoading: false,
        error: null,
      })

      return sessions
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to load sessions"
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw new Error(errorMessage)
    }
  },

  getSession: async (sessionId) => {
    set({ isLoading: true, error: null })

    try {
      const response = await sessionsAPI.getSession(sessionId)
      const session = response.data.session

      set({
        currentSession: session,
        isLoading: false,
        error: null,
      })

      return session
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to load session"
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw new Error(errorMessage)
    }
  },

  endSession: async (sessionId) => {
    set({ isLoading: true, error: null })

    try {
      const response = await sessionsAPI.endSession(sessionId)
      const session = response.data.session

      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? session : s)),
        currentSession: state.currentSession?.id === sessionId ? session : state.currentSession,
        isLoading: false,
        error: null,
      }))

      return session
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to end session"
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw new Error(errorMessage)
    }
  },

  updateSessionSettings: async (sessionId, settings) => {
    set({ isLoading: true, error: null })

    try {
      const response = await sessionsAPI.updateSettings(sessionId, settings)
      const session = response.data.session

      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? session : s)),
        currentSession: state.currentSession?.id === sessionId ? session : state.currentSession,
        isLoading: false,
        error: null,
      }))

      toast.success("Session settings updated")
      return session
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to update session settings"
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw new Error(errorMessage)
    }
  },

  clearCurrentSession: () => {
    set({ currentSession: null })
  },

  clearError: () => {
    set({ error: null })
  },

  // Real-time updates
  updateSession: (sessionId, updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)),
      currentSession:
        state.currentSession?.id === sessionId ? { ...state.currentSession, ...updates } : state.currentSession,
    }))
  },

  addMessage: (sessionId, message) => {
    set((state) => {
      if (state.currentSession?.id === sessionId) {
        return {
          currentSession: {
            ...state.currentSession,
            messages: [...(state.currentSession.messages || []), message],
          },
        }
      }
      return state
    })
  },

  addFile: (sessionId, file) => {
    set((state) => {
      if (state.currentSession?.id === sessionId) {
        return {
          currentSession: {
            ...state.currentSession,
            files: [file, ...(state.currentSession.files || [])],
          },
        }
      }
      return state
    })
  },

  removeFile: (sessionId, fileId) => {
    set((state) => {
      if (state.currentSession?.id === sessionId) {
        return {
          currentSession: {
            ...state.currentSession,
            files: (state.currentSession.files || []).filter((f) => f.id !== fileId),
          },
        }
      }
      return state
    })
  },
}))

export { useSessionStore }
