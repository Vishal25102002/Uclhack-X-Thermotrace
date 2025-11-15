import React from "react"
import { Button } from "@/components/ui"
import { ArrowLeft } from "lucide-react"

export interface DetailViewBackButtonProps {
  onClick: () => void
  label?: string
}

export default function DetailViewBackButton({
  onClick,
  label = "Back",
}: DetailViewBackButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="mb-4"
      aria-label={label}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
