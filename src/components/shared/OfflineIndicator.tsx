"use client"

import React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface OfflineIndicatorProps {
  isConnected: boolean
  className?: string
}

export default function OfflineIndicator({
  isConnected,
  className,
}: OfflineIndicatorProps) {
  if (isConnected) return null

  return (
    <Alert
      variant="destructive"
      className={cn(
        "fixed top-20 left-1/2 z-50 w-auto -translate-x-1/2 transform rounded-md shadow-lg",
        className
      )}
    >
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        Connection lost. Attempting to reconnect...
      </AlertDescription>
    </Alert>
  )
}
