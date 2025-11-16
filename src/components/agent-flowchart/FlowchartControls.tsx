"use client"

import React from "react"
import { Play, Pause, RotateCcw, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PlaybackSpeed } from "@/types/flowchart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FlowchartControlsProps {
  isPlaying: boolean
  currentStep: number
  totalSteps: number
  speed: PlaybackSpeed
  progress: number
  onReset: () => void
  onSpeedChange: (speed: PlaybackSpeed) => void
}

const speedOptions: PlaybackSpeed[] = [0.5, 1, 2, 4]

export function FlowchartControls({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  progress,
  onReset,
  onSpeedChange
}: FlowchartControlsProps) {
  return (
    <div className="space-y-3">
      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-8 w-8 p-0"
          title="Reset"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        {/* Speed Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-3">
              <span className="text-xs font-semibold">{speed}x</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {speedOptions.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => onSpeedChange(s)}
                className={speed === s ? "bg-blue-50 font-semibold" : ""}
              >
                {s}x Speed
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>Step {currentStep} / {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}
