import React from "react"
import { Badge, BadgeProps } from "./badge"
import { cn } from "@/lib/utils"

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "normal" | "warning" | "critical" | "info"
  children: React.ReactNode
}

export default function StatusBadge({ 
  status, 
  className,
  children,
  ...props 
}: StatusBadgeProps) {
  const variantMap: Record<StatusBadgeProps["status"], BadgeProps["variant"]> = {
    normal: "success",
    warning: "warning",
    critical: "error",
    info: "info",
  }

  return (
    <Badge 
      variant={variantMap[status]} 
      className={cn(className)} 
      {...props}
    >
      {children}
    </Badge>
  )
}
