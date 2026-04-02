"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRole } from "@/context/role-context"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import api from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ShieldCheck,
  History,
  LayoutDashboard,
  BarChart3,
  Plus
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function DashboardHome() {
  const { role, user } = useRole()
  const queryClient = useQueryClient()
  
  // Transaction Form State
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    type: "EXPENSE",
    notes: ""
  })

  const mutation = useMutation({
    mutationFn: async (newData: any) => {
      const res = await api.post("/transactions", {
        ...newData,
        amount: parseFloat(newData.amount)
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] })
      queryClient.invalidateQueries({ queryKey: ["recent-transactions-trend"] })
      setIsOpen(false)
      setFormData({ amount: "", category: "", type: "EXPENSE", notes: "" })
    },
    onError: (error: any) => {
      alert(`Access Denied or Validation Error: \n\n${error?.response?.data?.message || error.message}`);
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  // 1. Live Intelligence: Summary Metrics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const res = await api.get("/dashboard/analytics")
      return res.data.data
    },
    staleTime: 60000 
  })

  // 2. Intelligence Pulse: Recent 10 Transactions Trend
  const { data: recentTrend, isLoading: trendsLoading } = useQuery({
    queryKey: ["recent-transactions-trend"],
    queryFn: async () => {
      const res = await api.get("/transactions?limit=10")
      return res.data
    },
    retry: false,
    staleTime: 30000
  })

  // Format trends for AreaChart: Liquidity Flow (Running Balance)
  const transactions = recentTrend?.data || []
  let cumulativeBalance = 0
  const trendData = [...transactions].reverse().map((tx: any) => {
    if (tx.type === "INCOME") cumulativeBalance += tx.amount
    else cumulativeBalance -= tx.amount
    
    return {
      display: new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' }),
      liquidity: cumulativeBalance,
      category: tx.category
    }
  })

  // Format expenses for PieChart
  const expenseDist = analytics?.distribution?.expense || []
  const COLORS = ["#4f46e5", "#7c3aed", "#2563eb", "#1d4ed8", "#3b82f6", "#6366f1"]
  const categoryData = expenseDist.map((item: any, idx: number) => ({
    name: item.category,
    value: item.amount,
    color: COLORS[idx % COLORS.length]
  }))

  const stats = [
    { 
      title: "Net Liquidity", 
      value: analytics?.summary?.netBalance ? `$${analytics.summary.netBalance.toLocaleString()}` : "$0.00", 
      change: analytics?.summary?.netChange || "+0.0%", 
      icon: Wallet,
      color: "text-indigo-400"
    },
    { 
      title: "Total Income", 
      value: analytics?.summary?.totalIncome ? `$${analytics.summary.totalIncome.toLocaleString()}` : "$0.00", 
      change: analytics?.summary?.incomeChange || "+0.0%", 
      icon: TrendingUp,
      color: "text-emerald-400"
    },
    { 
      title: "Total Expense", 
      value: analytics?.summary?.totalExpense ? `$${analytics.summary.totalExpense.toLocaleString()}` : "$0.00", 
      change: analytics?.summary?.expenseChange || "-0.0%", 
      icon: TrendingDown,
      color: "text-rose-400"
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      <header className="flex justify-between items-end mb-2">
         <div>
            <h1 className="text-2xl font-bold text-zinc-100 uppercase tracking-tighter">Dashboard</h1>
            <p className="text-zinc-500 text-[10px] font-mono">USER: {user?.name || "GUEST"} // STATUS: ACTIVE</p>
         </div>
         <div className="flex gap-3">
             {role !== "VIEWER" && (
               <Dialog open={isOpen} onOpenChange={setIsOpen}>
                   <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4 text-xs font-bold gap-2">
                          <Plus className="w-4 h-4" />
                          Add Transaction
                      </Button>
                   </DialogTrigger>
                   <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                      <form onSubmit={handleSubmit}>
                          <DialogHeader>
                              <DialogTitle>Add Transaction</DialogTitle>
                              <DialogDescription className="text-zinc-500">
                                  Record a new financial movement in the ledger.
                              </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                  <Label htmlFor="amount">Amount ($)</Label>
                                  <Input 
                                    id="amount" 
                                    type="number" 
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01" 
                                    className="bg-black/40 border-zinc-800" 
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    required
                                  />
                              </div>
                              <div className="grid gap-2">
                                  <Label>Category</Label>
                                  <Select 
                                    value={formData.category} 
                                    onValueChange={(val) => setFormData({...formData, category: val})}
                                    required
                                  >
                                      <SelectTrigger className="bg-black/40 border-zinc-800">
                                          <SelectValue placeholder="Select Category" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                          <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                                          <SelectItem value="SALARY">Salary</SelectItem>
                                          <SelectItem value="OPERATIONS">Operations</SelectItem>
                                          <SelectItem value="MISC">Miscellaneous</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="grid gap-2">
                                  <Label>Type</Label>
                                  <Select 
                                    value={formData.type} 
                                    onValueChange={(val) => setFormData({...formData, type: val})}
                                  >
                                      <SelectTrigger className="bg-black/40 border-zinc-800">
                                          <SelectValue placeholder="Select Type" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                          <SelectItem value="INCOME" className="text-emerald-400">Income</SelectItem>
                                          <SelectItem value="EXPENSE" className="text-rose-400">Expense</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="grid gap-2">
                                  <Label htmlFor="notes">Notes</Label>
                                  <Input 
                                    id="notes" 
                                    placeholder="Transaction details..." 
                                    className="bg-black/40 border-zinc-800"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                  />
                              </div>
                          </div>
                          <DialogFooter>
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="border-zinc-800 text-zinc-400 hover:text-white"
                                onClick={() => setIsOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                className="bg-indigo-600 hover:bg-indigo-700"
                                disabled={mutation.isPending || !formData.amount || !formData.category}
                              >
                                {mutation.isPending ? "Recording..." : "Record Entry"}
                              </Button>
                          </DialogFooter>
                      </form>
                   </DialogContent>
               </Dialog>
             )}
         </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="bg-black/20 border-zinc-800 backdrop-blur-xl hover:border-zinc-700 transition-colors group cursor-default">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color} opacity-50 group-hover:opacity-100 transition-all`} />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="h-8 w-24 bg-zinc-800/50 animate-pulse rounded" />
                ) : (
                  <div className="text-2xl font-bold tracking-tight text-zinc-100">{stat.value}</div>
                )}
                <p className="text-[10px] text-zinc-500 mt-1 font-mono hover:text-zinc-400 transition-colors">
                  <span className={stat.change.startsWith("+") ? "text-emerald-500" : "text-rose-500"}>
                    {stat.change}
                  </span>{" "}
                  vs. Previous Month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-96 flex flex-col border-zinc-800 bg-black/20 overflow-hidden group">
              <CardHeader className="border-b border-zinc-800/50">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-indigo-400 uppercase tracking-widest italic flex items-center gap-2">
                       <BarChart3 className="w-3.5 h-3.5" />
                       Cash Flow
                    </CardTitle>
                    <span className="text-[9px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">RT_TELEMETRY: ACTIVE</span>
                 </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 pt-6">
                {trendsLoading ? (
                  <div className="h-full flex items-center justify-center text-[10px] font-mono text-zinc-700 animate-pulse">Syncing Time-Series...</div>
                ) : trendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[10px] font-mono text-zinc-800 italic uppercase">Log Registry Empty</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorLiquidity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="display" 
                        stroke="#27272a" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        fontFamily="monospace"
                      />
                      <YAxis 
                        stroke="#27272a" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                        fontFamily="monospace"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid #18181b", borderRadius: "10px", backdropFilter: "blur(20px)" }}
                        itemStyle={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, "NET_FLOW"]}
                        labelFormatter={(label, payload) => {
                          if (payload?.[0]) return payload[0].payload.category || label;
                          return label;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="liquidity" 
                        stroke="#4f46e5" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorLiquidity)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="h-96 flex flex-col border-zinc-800 bg-black/20 overflow-hidden group">
               <CardHeader className="border-b border-zinc-800/50">
                  <CardTitle className="text-xs font-bold text-emerald-400 uppercase tracking-widest italic flex items-center gap-2">
                     <LayoutDashboard className="w-3.5 h-3.5" />
                    Expenses
                  </CardTitle>
               </CardHeader>
               <CardContent className="flex-1 flex flex-col p-4">
                  {analyticsLoading ? (
                    <div className="flex-1 flex items-center justify-center text-[10px] font-mono text-zinc-700 animate-pulse">Aggregating Volume...</div>
                  ) : categoryData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[10px] font-mono text-zinc-800 italic">No Distribution Data</div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={8}
                              dataKey="value"
                              stroke="none"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid #18181b", borderRadius: "10px" }}
                              itemStyle={{ textTransform: "uppercase", fontSize: "9px", fontWeight: "bold" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2.5 mt-4">
                        {categoryData.slice(0, 4).map((c) => (
                          <div key={c.name} className="flex items-center justify-between text-[9px] font-mono transition-opacity">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                              <span className="text-zinc-500 uppercase">{c.name}</span>
                            </div>
                            <span className="text-zinc-400 font-bold">${c.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
              </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-zinc-800 bg-black/20">
          <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle className="text-sm font-bold text-zinc-300 tracking-widest uppercase">Latest Entries</CardTitle>
             <ShieldCheck className="w-4 h-4 text-indigo-500 opacity-50" />
          </CardHeader>
          <CardContent className="border-t border-zinc-800/50 p-0 overflow-hidden">
             {(analytics?.recentTransactions?.length || 0) > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-[11px] font-mono border-collapse">
                   <thead className="bg-zinc-900/30 text-zinc-500 uppercase tracking-tighter text-[9px] border-b border-zinc-800/50">
                     <tr>
                       <th className="px-6 py-3 text-left font-bold">Trace_ID</th>
                       <th className="px-6 py-3 text-left font-bold">Category</th>
                       <th className="px-6 py-3 text-left font-bold">Type</th>
                       <th className="px-6 py-3 text-right font-bold">Volume</th>
                       <th className="px-6 py-3 text-right font-bold">Timestamp</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-800/30">
                     {analytics.recentTransactions.map((tx: any) => (
                       <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors group">
                         <td className="px-6 py-3 text-zinc-500 group-hover:text-zinc-400">{tx.id.substring(0, 8).toUpperCase()}</td>
                         <td className="px-6 py-3 font-bold text-zinc-300">{tx.category}</td>
                         <td className={cn(
                           "px-6 py-3 font-bold px-4",
                           tx.type === "INCOME" ? "text-emerald-500" : "text-rose-500"
                         )}>
                            {tx.type}
                         </td>
                         <td className="px-6 py-3 text-right font-bold text-zinc-100">
                            {tx.type === "INCOME" ? "+" : "-"}${Number(tx.amount).toLocaleString()}
                         </td>
                         <td className="px-6 py-3 text-right text-zinc-500">{new Date(tx.date).toLocaleDateString()}</td>
                       </tr>
                     ))}
                   </tbody>
                  </table></div>
             ) : (
               <div className="text-[10px] font-mono text-zinc-600 italic py-12 text-center uppercase tracking-widest bg-zinc-950/50">
                 Synchronizing Tunnel with FinanceX SQL Core...
               </div>
             )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
