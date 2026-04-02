"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api-client"
import { Search, Filter, Plus, FileDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function TransactionsPage() {
  const [search, setSearch] = useState("")
  
  const { data: trxResult, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["transactions", search],
    queryFn: async () => {
      const res = await api.get("/transactions", {
        params: { search: search || undefined }
      })
      return res.data
    }
  })

  // Backend returns result.data which becomes trxResult.data in the frontend
  const transactions = trxResult?.data || []

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase italic flex items-center gap-3">
             Transactions
             {isFetching && <RefreshCw className="w-4 h-4 animate-spin text-indigo-500 opacity-50" />}
          </h2>
          <p className="text-xs text-zinc-500 font-mono tracking-widest">LIVE_SQL_MAIN_BUFFER</p>
        </div>
        <div className="flex items-center gap-2">
           <Button size="sm" variant="outline" className="gap-2 border-zinc-800 bg-black/20 text-zinc-400 text-xs">
              <FileDown className="w-3 h-3" />
              SNAPSHOT
           </Button>
           <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold shadow-[0_0_15px_rgba(79,70,229,0.2)]">
              <Plus className="w-3 h-3" />
              NEW_ENTRY
           </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-600" />
          <Input
            placeholder="Search Registry (Category, Notes)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-black/40 border-zinc-800 text-zinc-300 text-xs font-mono"
          />
        </div>
        <Button variant="outline" size="icon" className="border-zinc-800 bg-black/20 text-zinc-500">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-black/20 overflow-hidden backdrop-blur-xl">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800">
              <TableHead className="w-[120px] text-[10px] font-bold uppercase tracking-widest text-zinc-500">Trace_ID</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Type</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Volume</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-[10px] font-mono text-zinc-700 opacity-50 uppercase tracking-widest animate-pulse italic">
                     Accessing Mainframe Buffer... Pulse 12ms
                  </TableCell>
               </TableRow>
            ) : transactions.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-48 text-center text-[10px] font-mono text-rose-500/50 uppercase tracking-widest italic border-dashed border-t border-zinc-800/20">
                      NULL_SET: Zero Records in Active Database.
                   </TableCell>
                </TableRow>
            ) : transactions.map((trx: any) => (
              <TableRow key={trx.id} className="border-zinc-800/50 hover:bg-indigo-500/5 transition-all">
                <TableCell className="font-mono text-[9px] text-zinc-500 opacity-60 italic">{trx.id?.slice(0, 8).toUpperCase()}</TableCell>
                <TableCell className="font-semibold text-zinc-200 text-xs italic uppercase tracking-tight">{trx.category || "GENERAL"}</TableCell>
                <TableCell>
                   <Badge className={cn(
                     "text-[9px] font-bold tracking-tighter px-1.5 py-0 h-4 border-none uppercase",
                     trx.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                   )}>
                      {trx.type}
                   </Badge>
                </TableCell>
                <TableCell className={cn(
                  "text-right font-bold text-sm tracking-tighter tabular-nums",
                  trx.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
                )}>
                   {trx.type === "INCOME" ? "+" : "-"}${Number(trx.amount).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-xs text-zinc-400">{new Date(trx.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

       {!isLoading && trxResult?.pagination && (
          <div className="flex items-center justify-between text-[10px] text-zinc-600 font-mono italic">
             <span className="uppercase tracking-widest px-1">Showing {transactions.length} of {trxResult.pagination.total} entries</span>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-zinc-800 h-7 text-[10px] px-2 bg-black/20 hover:text-zinc-300">PREV_INDEX</Button>
                <Button variant="outline" size="sm" className="border-zinc-800 h-7 text-[10px] px-2 bg-black/20 hover:text-zinc-300">NEXT_INDEX</Button>
             </div>
          </div>
       )}
    </div>
  )
}
