"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api-client"
import { History, Terminal, FileText, Lock, RefreshCw } from "lucide-react"
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

export default function AuditLogPage() {
  const { data: auditResult, isLoading, isFetching } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const res = await api.get("/audit")
      return res.data
    }
  })

  const logs = auditResult?.data || []

  // Derived stats from the logs batch
  const securitylogs = logs.filter((l: any) => ["UPDATE", "DELETE"].includes(l.action)).length
  const financialLogs = logs.filter((l: any) => l.tableName === "Transaction").length

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase italic">Audits</h2>
          <p className="text-xs text-zinc-500 font-mono tracking-widest">IMMUTABLE_PRISMA_TRACE_TUNNEL</p>
        </div>
        {isFetching && <RefreshCw className="w-4 h-4 animate-spin text-indigo-500 opacity-50" />}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 border border-zinc-800 rounded-lg bg-black/40 flex flex-col gap-2">
             <Terminal className="w-5 h-5 text-indigo-400" />
             <div className="text-xl font-bold">{auditResult?.pagination?.total || 0}</div>
             <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Total Events</div>
          </div>
          <div className="p-4 border border-zinc-800 rounded-lg bg-black/40 flex flex-col gap-2">
             <Lock className="w-5 h-5 text-rose-400" />
             <div className="text-xl font-bold">{securitylogs}</div>
             <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Critical Modifs</div>
          </div>
          <div className="p-4 border border-zinc-800 rounded-lg bg-black/40 flex flex-col gap-2">
             <FileText className="w-5 h-5 text-emerald-400" />
             <div className="text-xl font-bold">{financialLogs}</div>
             <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Ledger Edits</div>
          </div>
          <div className="p-4 border border-zinc-800 rounded-lg bg-black/40 flex flex-col gap-2">
             <History className="w-5 h-5 text-amber-400" />
             <div className="text-xl font-bold">1ms</div>
             <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Sync Latency</div>
          </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-black/20 overflow-hidden backdrop-blur-xl">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800">
              <TableHead className="w-[120px] text-[10px] font-bold uppercase tracking-widest text-zinc-500">Event_ID</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Protocol</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Registry</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Trace_Subject</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-[10px] font-mono text-zinc-700 animate-pulse uppercase italic">
                     Scanning Immutable Trace... Accessing Layer-2
                  </TableCell>
               </TableRow>
            ) : logs.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-48 text-center text-[10px] font-mono text-zinc-600 italic uppercase">
                      ZERO_HISTORICAL_TRACE_LOGS
                   </TableCell>
                </TableRow>
            ) : logs.map((log: any) => (
              <TableRow key={log.id} className="border-zinc-800/50 hover:bg-indigo-500/5 transition-all">
                <TableCell className="font-mono text-[9px] text-zinc-500 italic uppercase">{log.id.substring(0, 8)}</TableCell>
                <TableCell>
                   <Badge variant="outline" className={cn(
                     "font-bold text-[9px] tracking-widest border-zinc-800 uppercase px-2 py-0 h-4",
                     log.action === "CREATE" ? "text-emerald-400" : log.action === "UPDATE" ? "text-indigo-400" : "text-rose-400"
                   )}>
                     {log.action}
                   </Badge>
                </TableCell>
                <TableCell className="text-[10px] font-mono text-zinc-400 opacity-60 uppercase">{log.tableName}</TableCell>
                <TableCell className="text-xs font-bold text-zinc-300 font-mono tracking-tighter italic uppercase">{log.recordId.substring(0, 8)}</TableCell>
                <TableCell className="text-right font-mono text-[10px] text-zinc-500 opacity-70">
                   {new Date(log.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
