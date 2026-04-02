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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "VIEWER"
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/register", formData)
      const token = response.data?.data?.token
      
      if (token) {
        localStorage.setItem("auth_token", token)
      }
      
      router.push("/login")
    } catch (err: any) {
      setError(err.response?.data?.message || "Onboarding Error: Access Protocol Denied.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-sm border-zinc-800 bg-black/40 backdrop-blur-xl">
        <form onSubmit={handleRegister}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Onboard Profile</CardTitle>
            <CardDescription className="text-zinc-500">
               Establish your identity in the FinanceX mainframe.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <div className="p-2 border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs rounded">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="full-name">Operative Name</Label>
              <Input 
                id="full-name" 
                placeholder="Operative ID" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required 
                className="bg-black/20 border-zinc-800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Identity</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="identity@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required 
                className="bg-black/20 border-zinc-800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Security Key</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required 
                className="bg-black/20 border-zinc-800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Initial Access Level</Label>
              <select 
                 className="flex h-10 w-full rounded-md border border-zinc-800 bg-black/40 px-3 py-1 text-xs shadow-sm outline-none text-zinc-300"
                 value={formData.role}
                 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="VIEWER">VIEWER (Read-Only Access)</option>
                <option value="ANALYST">ANALYST (Intelligence Management)</option>
                <option value="ADMIN">ADMIN (Full Governance)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
               type="submit" 
               className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all" 
               disabled={loading}
            >
              {loading ? "Establishing Identity..." : "Finalize Profile"}
            </Button>
            <div className="text-center text-xs text-zinc-500">
               Already in our database?{" "}
               <Link href="/login" className="text-zinc-300 hover:text-white underline underline-offset-4">
                 Sign In
               </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
