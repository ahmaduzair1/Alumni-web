import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchUserModel,
  signIn as authSignIn,
  signOut as authSignOut,
  subscribeAuth,
  registerUser,
  signInWithGoogle as googleSignIn,
  sendPasswordReset,
  completePasswordReset,
  updateUserProfile,
} from '../services/authService'
import type { UserModel, UserRole } from '../lib/types'

interface AuthContextValue {
  user: UserModel | null
  loading: boolean
  signIn: (identifier: string, password: string) => Promise<UserModel>
  register: (params: {
    email: string
    password: string
    name: string
    role: UserRole
    sapId?: string
  }) => Promise<UserModel>
  resetPassword: (email: string) => Promise<void>
  confirmReset: (code: string, newPassword: string) => Promise<void>
  signInWithGoogle: (role: UserRole) => Promise<UserModel>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (
    data: Partial<{
      name: string
      email: string
      photoUrl: string
      classYear: string
      degree: string
      institution: string
      jobTitle: string
      company: string
      phone: string
    }>,
  ) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeAuth(async (fbUser) => {
      if (!fbUser) {
        setUser(null)
        setLoading(false)
        return
      }
      try {
        const model = await fetchUserModel(fbUser.uid)
        setUser(model)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    async signIn(identifier, password) {
      const model = await authSignIn(identifier, password)
      if (!model) throw new Error('User profile not found.')
      setUser(model)
      return model
    },
    async register(params) {
      const model = await registerUser(params)
      setUser(model)
      return model
    },
    async resetPassword(email) {
      await sendPasswordReset(email)
    },
    async confirmReset(code, newPassword) {
      await completePasswordReset(code, newPassword)
    },
    async signInWithGoogle(role) {
      const model = await googleSignIn(role)
      setUser(model)
      return model
    },
    async signOut() {
      await authSignOut()
      setUser(null)
    },
    async refreshUser() {
      if (!user) return
      const model = await fetchUserModel(user.uid)
      setUser(model)
    },
    async updateProfile(data) {
      if (!user) throw new Error('Not signed in')
      await updateUserProfile(user.uid, data)
      const model = await fetchUserModel(user.uid)
      setUser(model)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
