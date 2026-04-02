"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api-client"
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
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { RefreshCw, BarChart3, PieChartIcon } from "lucide-react"

export default function AnalyticsPage() {
  const { data: analyticsResult, isLoading: analyticsLoading } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const res = await api.get("/dashboard/analytics")
      return res.data
    }
  })

  const { data: trendsResult, isLoading: trendsLoading, isFetching } = useQuery({
    queryKey: ["recent-transactions-trend"],
    queryFn: async () => {
      const res = await api.get("/transactions?limit=10")
      return res.data
    }
  })

  // Format trends for AreaChart: Liquidity Flow (Running Balance)
  const transactions = trendsResult?.data || []
  let cumulativeBalance = 0
  const trendData = [...transactions].reverse().map((tx: any) => {
    if (tx.type === "INCOME") cumulativeBalance += tx.amount
    else cumulativeBalance -= tx.amount
    
    return {
      display: new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' }),
      liquidity: cumulativeBalance,
      amount: tx.amount,
      type: tx.type,
      category: tx.category
    }
  })

  // Format expenses for PieChart
  const expenseDist = analyticsResult?.data?.distribution?.expense || []
  const COLORS = ["#4f46e5", "#7c3aed", "#2563eb", "#1d4ed8", "#3b82f6", "#6366f1"]
  const categoryData = expenseDist.map((item: any, idx: number) => ({
    name: item.category,
    value: item.amount,
    color: COLORS[idx % COLORS.length]
  }))

  const totalExpense = analyticsResult?.data?.summary?.totalExpense || 1

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase italic">Intelligence Portal</h2>
          <p className="text-xs text-zinc-500 font-mono tracking-widest">LIVE_ECONOMY_TELEMETRY</p>
        </div>
        {isFetching && <RefreshCw className="w-4 h-4 animate-spin text-indigo-500 opacity-50" />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-zinc-800 bg-black/20 backdrop-blur-xl">
          <CardHeader className="border-b border-zinc-800/50 mb-6">
            <div className="flex items-center gap-2">
               <BarChart3 className="w-4 h-4 text-indigo-500" />
               <CardTitle className="text-zinc-100 text-sm font-bold uppercase tracking-widest">Liquidity Flow Trend</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-mono text-zinc-500">REALTIME_TRANSACTION_PULSE_10_POINTS</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            {trendsLoading ? (
               <div className="h-full flex items-center justify-center text-[10px] font-mono text-zinc-700 uppercase animate-pulse">
                  Calibrating Time-Series... Accessing DB
               </div>
            ) : trendData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-[10px] font-mono text-zinc-800 uppercase italic">
                  INSIGHT_ID_0: Data Points Pending
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorLiquidity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="display" 
                    stroke="#3f3f46" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="monospace"
                  />
                  <YAxis 
                    stroke="#3f3f46" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    fontFamily="monospace"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid #27272a", borderRadius: "8px", backdropFilter: "blur(10px)" }}
                    itemStyle={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}
                    formatter={(value: any, name: any) => {
                      if (name === "liquidity") return [`$${value.toLocaleString()}`, "Net Flow"];
                      return [value, `${name}`];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.category || label;
                      }
                      return label;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="liquidity" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorLiquidity)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-black/20 backdrop-blur-xl">
          <CardHeader className="border-b border-zinc-800/50 mb-6">
            <div className="flex items-center gap-2">
               <PieChartIcon className="w-4 h-4 text-indigo-500" />
               <CardTitle className="text-zinc-100 text-sm font-bold uppercase tracking-widest">Volume Index</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-mono text-zinc-500">CONSUMPTION_BY_CATEGORY</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            {analyticsLoading ? (
               <div className="h-full flex items-center justify-center text-[10px] font-mono text-zinc-700 uppercase animate-pulse">
                  Aggregating Categories...
               </div>
            ) : categoryData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-[10px] font-mono text-zinc-800 uppercase italic">
                  DIST_ID_0: Buffer Empty
               </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                        data={categoryData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid #27272a", borderRadius: "8px", backdropFilter: "blur(10px)" }}
                      itemStyle={{ textTransform: "uppercase", fontSize: "10px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-2 mt-6 px-2">
                  {categoryData.map((c: any) => (
                    <div key={c.name} className="flex items-center justify-between text-[10px] font-mono group">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full opacity-70" style={{ backgroundColor: c.color }} />
                          <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase">{c.name}</span>
                        </div>
                        <span className="text-zinc-400 font-bold">${c.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
