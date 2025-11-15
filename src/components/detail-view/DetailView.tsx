"use client"

import React from "react"
import { cn } from "@/lib/utils"
import DetailViewBackButton from "./DetailViewBackButton"
import { ChainOfThoughtPanel } from "@/components/chain-of-thought"
import { DigitalTwinPanel } from "@/components/digital-twin"
import { DecisionSummary } from "@/components/decision-summary"

export interface DetailViewProps {
  isOpen: boolean
  onClose: () => void
  decisionId: string
  className?: string
}

export default function DetailView({
  isOpen,
  onClose,
  decisionId,
  className,
}: DetailViewProps) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex flex-col bg-background transition-all duration-300 ease-in-out",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
        className
      )}
      style={{ paddingTop: "80px" }} // Account for header height
    >
      <div className="px-6 pt-4">
        <DetailViewBackButton onClick={onClose} />
      </div>

      {/* Main Content: Split Layout */}
      <div className="flex flex-1 gap-4 overflow-hidden px-6 pb-4">
        {/* Left Panel: Chain-of-Thought (45%) */}
        <div className="flex w-[45%] flex-col overflow-hidden">
          <ChainOfThoughtPanel decisionId={decisionId} />
        </div>

        {/* Right Panel: Digital Twin (55%) */}
        <div className="flex w-[55%] flex-col overflow-hidden">
          <DigitalTwinPanel decisionId={decisionId} />
        </div>
      </div>

      {/* Bottom Section: Decision Summary */}
      <div className="border-t bg-background px-6 py-4">
        <DecisionSummary decisionId={decisionId} />
      </div>
    </div>
  )
}
