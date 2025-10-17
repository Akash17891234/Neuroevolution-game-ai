"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ControlPanelProps {
  isRunning: boolean
  isPaused: boolean
  isConnected: boolean
  populationSize: number
  onPopulationSizeChange: (size: number) => void
  onStart: () => void
  onStop: () => void
  onPause: () => void
  onResume: () => void
}

export default function ControlPanel({
  isRunning,
  isPaused,
  isConnected,
  populationSize,
  onPopulationSizeChange,
  onStart,
  onStop,
  onPause,
  onResume,
}: ControlPanelProps) {
  const [localPopSize, setLocalPopSize] = useState(populationSize)

  const handleStart = () => {
    onPopulationSizeChange(localPopSize)
    onStart()
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Simulation Controls</CardTitle>
        <CardDescription>Configure and run the evolution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Population Size */}
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-2">Population Size: {localPopSize}</label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={localPopSize}
            onChange={(e) => setLocalPopSize(Number(e.target.value))}
            disabled={isRunning}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-slate-500 mt-1">Agents per generation</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleStart}
            disabled={!isConnected || isRunning}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isRunning ? "Running..." : "Start"}
          </Button>
          {isRunning && (
            <Button
              onClick={isPaused ? onResume : onPause}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}
          <Button
            onClick={onStop}
            disabled={!isRunning}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            Stop
          </Button>
        </div>

        {/* Status */}
        <div className="bg-slate-700 rounded p-3 text-sm text-slate-300">
          <p className="font-medium mb-1">Status</p>
          <p>{isConnected ? "✓ Connected to server" : "✗ Disconnected"}</p>
          <p>{isRunning ? (isPaused ? "⏸ Simulation paused" : "▶ Simulation running") : "⏹ Simulation stopped"}</p>
        </div>
      </CardContent>
    </Card>
  )
}
