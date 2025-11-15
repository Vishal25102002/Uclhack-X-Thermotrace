import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
}

export default function LoadingSpinner({
  className,
  size = "md",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
      </div>
    )
  }

  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  )
}
