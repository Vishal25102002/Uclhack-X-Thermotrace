"use client"

import React, { useEffect, useState } from "react"
import { Clock, Bell, Settings, User, Zap, Activity } from "lucide-react"
import { Badge, StatusBadge } from "@/components/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type SystemStatus = "normal" | "warning" | "critical"

export interface HeaderBarProps {
  systemStatus?: SystemStatus
  alertCount?: number
  agentHealth?: "healthy" | "degraded" | "offline"
  onAlertClick?: () => void
}

export default function HeaderBar({
  systemStatus = "normal",
  alertCount = 0,
  agentHealth = "healthy",
  onAlertClick,
}: HeaderBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getStatusLabel = (status: SystemStatus) => {
    switch (status) {
      case "normal":
        return "Normal"
      case "warning":
        return "Warning"
      case "critical":
        return "Critical"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "success"
      case "degraded":
        return "warning"
      case "offline":
        return "error"
      default:
        return "info"
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background shadow-sm">
      <div className="h-full px-6">
        <div className="flex h-full items-center justify-between">
          {/* Left section: Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* ThermoTrace Logo - Temperature monitoring icon */}
              <div className="relative">
                <div className="rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 p-3 shadow-lg">
                  <svg
                    className="h-7 w-7 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {/* Thermometer body */}
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                    {/* Temperature indicator lines */}
                    <path d="M9 8h2" strokeLinecap="round" />
                    <path d="M9 11h2" strokeLinecap="round" />
                    {/* Trace/wave pattern */}
                    <path d="M17 3 L19 5 L21 3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 7 L19 9 L21 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  ThermoTrace
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  AI-Powered Thermal Monitoring
                </p>
              </div>
            </div>
          </div>

          {/* Right section: Clock and User Menu */}
          <div className="flex items-center gap-3">
            {/* Clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <time
                dateTime={mounted ? currentTime.toISOString() : ""}
                className="text-sm tabular-nums font-semibold text-slate-700 dark:text-slate-100"
              >
                {mounted ? formatTime(currentTime) : "--:--:--"}
              </time>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center justify-center rounded-lg w-9 h-9 text-sm font-medium transition-all bg-slate-700 text-white shadow-sm",
                    "hover:bg-slate-800 hover:shadow-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                  )}
                  aria-label="User menu"
                >
                  <User className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
