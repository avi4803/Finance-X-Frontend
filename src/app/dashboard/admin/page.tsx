"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api-client"
import { 
  ShieldAlert, 
  UserPlus, 
  ShieldCheck, 
  ShieldClose, 
  RefreshCw,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { useRole } from "@/context/role-context"

export default function AdminHubPage() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useRole()
  
  const { data: usersResult, isLoading, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users")
      return res.data
    }
  })

  const users = usersResult?.data || []

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return api.patch(`/users/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-indigo-400 uppercase tracking-[.25em] italic flex items-center gap-2">
             Manage Users
             {isFetching && <RefreshCw className="w-4 h-4 animate-spin text-indigo-500/40" />}
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest">SECURE_OPERATIVE_FLEET_REGISTRY</p>
        </div>
        <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold border-none shadow-[0_0_20px_rgba(79,70,229,0.2)]">
           <UserPlus className="w-3 h-3" />
           ONBOARD_ID
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-black/40 backdrop-blur-3xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-zinc-900/40">
            <TableRow className="border-zinc-800">
              <TableHead className="text-[10px] uppercase font-bold tracking-[.15em] text-zinc-500 py-4 px-6">Subject_Identity</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-[.15em] text-zinc-500">Authorization</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-[.15em] text-zinc-500">Pulse</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-[.15em] text-zinc-500">Auth_Method</TableHead>
              <TableHead className="text-right text-[10px] uppercase font-bold tracking-[.15em] text-zinc-500 px-6">Terminal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                     <div className="text-[10px] font-mono text-indigo-400 animate-pulse tracking-[.1em] italic uppercase">
                        Scanning Mainframe Identities... Pulse 8ms
                     </div>
                  </TableCell>
               </TableRow>
            ) : users.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-48 text-center text-[10px] text-rose-500 opacity-50 tracking-[.1em] italic uppercase">
                      ZERO_OPERATIVES_REGISTERED
                   </TableCell>
                </TableRow>
            ) : users.map((user: any) => (
              <TableRow key={user.id} className="border-zinc-800/50 hover:bg-indigo-500/5 transition-all">
                <TableCell className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="font-bold text-sm text-zinc-100">{user.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500 lowercase tracking-tight italic opacity-70">{user.email}</span>
                   </div>
                </TableCell>
                <TableCell>
                   <select 
                     value={user.role} 
                     onChange={(e) => updateUserMutation.mutate({ id: user.id, data: { role: e.target.value } })}
                     disabled={updateUserMutation.isPending || user.id === currentUser?.id}
                     className={cn(
                       "bg-black/60 border rounded text-[9px] font-bold tracking-[.1em] uppercase px-2 py-1 outline-none transition-colors",
                       user.role === "ADMIN" ? "text-indigo-400 border-indigo-400/20" : "text-zinc-500 border-zinc-800 hover:border-zinc-600",
                       user.id === currentUser?.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                     )}
                   >
                     <option value="ADMIN">ADMIN</option>
                     <option value="ANALYST">ANALYST</option>
                     <option value="VIEWER">VIEWER</option>
                   </select>
                </TableCell>
                <TableCell>
                   <Badge className={cn(
                     "text-[9px] font-bold tracking-tighter uppercase px-1.5 py-0 h-4 border-none",
                     user.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                   )}>
                      {user.status}
                   </Badge>
                </TableCell>
                <TableCell className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
                   SECURE_JWT
                </TableCell>
                <TableCell className="text-right px-6">
                   <div className="flex items-center justify-end gap-1">
                      {user.status === "ACTIVE" ? (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-30"
                            onClick={() => updateUserMutation.mutate({ id: user.id, data: { status: "INACTIVE" } })}
                            disabled={updateUserMutation.isPending || user.id === currentUser?.id}
                            title={user.id === currentUser?.id ? "Cannot deactivate yourself" : "Deactivate Operative"}
                          >
                            <ShieldClose className="w-3.5 h-3.5" />
                          </Button>
                      ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-30"
                            onClick={() => updateUserMutation.mutate({ id: user.id, data: { status: "ACTIVE" } })}
                            disabled={updateUserMutation.isPending || user.id === currentUser?.id}
                            title={user.id === currentUser?.id ? "Cannot modify yourself" : "Activate Operative"}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </Button>
                      )}
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-4">
          <ShieldAlert className="w-5 h-5 text-rose-500 mt-1 shrink-0 animate-pulse" />
          <div>
             <h4 className="text-xs font-bold text-rose-500 uppercase tracking-[.15em] italic">Governance Protocol Advisory</h4>
             <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed tracking-tight">
                Identification modification protocols for <strong>GOD_MODE (ADMIN)</strong> elevation are strictly audited. Every status override is logged in the <strong>Immutable Ledger</strong> for cross-mainframe verification.
             </p>
          </div>
      </div>
    </div>
  )
}
