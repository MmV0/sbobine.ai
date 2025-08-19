'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  hasPaymentMethod: boolean
  trialUsed: boolean
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simula il caricamento dell'utente salvato
    const savedUser = localStorage.getItem('sbobine_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    // Simula una chiamata API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      hasPaymentMethod: true, // Simula sempre metodo di pagamento configurato per test
      trialUsed: false,
      createdAt: new Date().toISOString(),
    }
    
    setUser(mockUser)
    localStorage.setItem('sbobine_user', JSON.stringify(mockUser))
    setLoading(false)
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockUser: User = {
      id: '2',
      email: 'user@gmail.com',
      name: 'Marco Rossi',
      avatar: 'https://lh3.googleusercontent.com/a/default-user',
      hasPaymentMethod: true, // Simula sempre metodo di pagamento configurato per test
      trialUsed: false,
      createdAt: new Date().toISOString(),
    }
    
    setUser(mockUser)
    localStorage.setItem('sbobine_user', JSON.stringify(mockUser))
    setLoading(false)
  }

  const loginWithApple = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockUser: User = {
      id: '3',
      email: 'user@icloud.com',
      name: 'Giulia Bianchi',
      hasPaymentMethod: true, // Simula sempre metodo di pagamento configurato per test
      trialUsed: false,
      createdAt: new Date().toISOString(),
    }
    
    setUser(mockUser)
    localStorage.setItem('sbobine_user', JSON.stringify(mockUser))
    setLoading(false)
  }

  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockUser: User = {
      id: Math.random().toString(),
      email,
      name,
      hasPaymentMethod: true, // Simula sempre metodo di pagamento configurato per test
      trialUsed: false,
      createdAt: new Date().toISOString(),
    }
    
    setUser(mockUser)
    localStorage.setItem('sbobine_user', JSON.stringify(mockUser))
    setLoading(false)
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return
    
    setLoading(true)
    // Simula una chiamata API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('sbobine_user', JSON.stringify(updatedUser))
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sbobine_user')
  }

  const value = {
    user,
    login,
    loginWithGoogle,
    loginWithApple,
    register,
    updateUser,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
