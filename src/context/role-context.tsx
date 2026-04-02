"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Role = "ADMIN" | "ANALYST" | "VIEWER"

interface User {
  id: string
  name: string
  email: string
  role: Role
}

interface RoleContextType {
  role: Role
  user: User | null
  isSidebarOpen: boolean
  setRole: (role: Role) => void
  setUser: (user: User | null) => void
  toggleSidebar: () => void
  logout: () => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("ADMIN") 
  const [user, setUser] = useState<User | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // Hydrate user from localStorage if exists
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user")
    if (savedUser) {
      const parsed = JSON.parse(savedUser)
      setUser(parsed)
      setRole(parsed.role)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <RoleContext.Provider value={{ role, setRole, user, setUser, logout, isSidebarOpen, toggleSidebar }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
