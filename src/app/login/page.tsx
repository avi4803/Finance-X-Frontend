"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api-client"
import { useRole, type Role } from "@/context/role-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { setRole, setUser } = useRole()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/login", { email, password })
      const { token, user } = response.data.data // Correct path based on success utility
      
      if (!token) throw new Error("NULL_SESSION_PACKET_RECEIVED")
      
      localStorage.setItem("auth_token", token)
      localStorage.setItem("auth_user", JSON.stringify(user))
      
      // Update global session
      setUser(user)
      if (user?.role) {
        setRole(user.role as Role)
      }
      
      // Small buffer to ensure localStorage is settled
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    } catch (err: any) {
      setError(err.response?.data?.message || "Internal Access Error: Authentication Refused.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-sm border-zinc-800 bg-black/40 backdrop-blur-xl">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
            <CardDescription className="text-zinc-500">
               Enter your email and password to access FinanceX.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <div className="p-2 border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs rounded">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="bg-black/20 border-zinc-800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="bg-black/20 border-zinc-800"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-xs text-zinc-500">
               New user?{" "}
               <Link href="/register" className="text-zinc-300 hover:text-white underline-offset-4 underline">
                 Create Account
               </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
