"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.replace("/login")
      } else {
        setAuthenticated(true)
      }
    }
    
    checkAuth()
  }, [router])

  if (!authenticated) return null

  return (
    <div className="flex h-screen bg-background text-foreground font-sans tracking-tight">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-black/5">
        <header className="h-16 border-b flex items-center px-8 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="text-sm font-medium text-muted-foreground">
            Workspace <span className="text-foreground mx-2">/</span> Main Control Center
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
