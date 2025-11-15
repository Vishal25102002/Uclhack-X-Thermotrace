import React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon
  size?: number | string
  className?: string
}

export default function Icon({ 
  icon: IconComponent, 
  size = 20, 
  className,
  ...props 
}: IconProps) {
  return (
    <IconComponent 
      size={size} 
      className={cn("shrink-0", className)} 
      {...props}
    />
  )
}
