"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  CreditCard, 
  LayoutDashboard, 
  History, 
  ShieldCheck, 
  Settings,
  LogOut,
  UserCircle,
  Menu,
  ChevronLeft,
  BarChart3,
  ArrowRightLeft
} from "lucide-react"
import { useRole, type Role } from "@/context/role-context"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "ANALYST", "VIEWER"] },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowRightLeft, roles: ["ADMIN", "ANALYST", "VIEWER"] },
  { name: "Audit Trail", href: "/dashboard/audit", icon: History, roles: ["ADMIN"] },
  { name: "Admin Nexus", href: "/dashboard/admin", icon: ShieldCheck, roles: ["ADMIN"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { role, setRole, user, logout, isSidebarOpen, toggleSidebar } = useRole()

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
      className="border-r bg-card flex flex-col h-full bg-black/40 backdrop-blur-3xl overflow-hidden relative z-50 shrink-0"
    >
      <div className="p-6 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {isSidebarOpen ? (
            <motion.div 
               key="logo-full"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               className="flex items-center gap-2 font-bold text-xl text-indigo-500 whitespace-nowrap"
            >
              <CreditCard className="w-8 h-8" />
              <span>FinanceX</span>
            </motion.div>
          ) : (
            <motion.div 
               key="logo-mini"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex items-center justify-center w-full"
            >
              <CreditCard className="w-8 h-8 text-indigo-500" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {isSidebarOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="h-8 w-8 text-zinc-500 hover:text-white shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
        )}
      </div>

      {!isSidebarOpen && (
          <div className="flex justify-center pb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar} 
                className="h-8 w-8 text-zinc-500 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </Button>
          </div>
      )}

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium",
              pathname === item.href
                ? "bg-indigo-500/10 text-indigo-400"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              !isSidebarOpen && "justify-center px-0"
            )}
            title={!isSidebarOpen ? item.name : ""}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-4 bg-zinc-900/40">
         <div className={cn(
            "px-2 py-3 rounded-lg border border-zinc-800 bg-black/40 flex items-center gap-3 group relative transition-all",
            !isSidebarOpen && "justify-center px-0 bg-transparent border-transparent"
         )}>
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
               <UserCircle className="w-5 h-5 text-indigo-400" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0 pr-2">
                 <div className="text-[11px] font-bold text-zinc-100 truncate uppercase tracking-tight">
                    {user?.name || "Guest User"}
                 </div>
                 <div className="text-[9px] font-mono text-zinc-500 truncate lowercase">{user?.email || "pending..."}</div>
              </div>
            )}
            
            {isSidebarOpen && (
              <Button 
                 variant="ghost" 
                 size="icon" 
                 className="h-7 w-7 text-zinc-600 hover:text-white hover:bg-rose-500/10 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                 onClick={logout}
                 title="Logout"
              >
                 <LogOut className="w-3.5 h-3.5" />
              </Button>
            )}
         </div>

         {isSidebarOpen && (
           <div className="px-3 animate-in fade-in duration-500">
               <Label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2 font-bold">
                  Access Level: <span className={role === "ADMIN" ? "text-indigo-400" : "text-emerald-400 font-mono"}>{role}</span>
               </Label>
               
               <Button variant="ghost" className="w-full justify-start text-[10px] font-normal h-8 opacity-40 hover:opacity-100 border border-zinc-800/0 hover:border-zinc-800 hover:bg-black/40">
                  <Settings className="w-3.2 h-3.2 mr-2 text-zinc-500" />
                  Settings
               </Button>
           </div>
         )}
      </div>
    </motion.aside>
  )
}
