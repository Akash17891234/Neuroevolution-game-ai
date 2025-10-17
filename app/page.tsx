"use client"

import { useState, useEffect } from "react"
import GameCanvas from "@/components/game-canvas"
import ControlPanel from "@/components/control-panel"
import StatsPanel from "@/components/stats-panel"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import { useWebSocket } from "@/hooks/use-websocket"

export default function Home() {
  const { isConnected, emit } = useWebSocket()
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [statsHistory, setStatsHistory] = useState<any[]>([])
  const [populationSize, setPopulationSize] = useState(50)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleGenerationComplete = (event: CustomEvent) => {
      const data = event.detail
      console.log("[v0] Generation complete received:", data)
      setGeneration(data.generation)
      setStats(data)
      setStatsHistory((prev) => [...prev, data])
      setError(null)
    }

    const handleSimulationStarted = () => {
      console.log("[v0] Simulation started event received")
      setIsRunning(true)
      setIsPaused(false)
      setError(null)
    }

    const handleSimulationStopped = () => {
      console.log("[v0] Simulation stopped event received")
      setIsRunning(false)
      setIsPaused(false)
    }

    const handleSimulationPaused = () => {
      console.log("[v0] Simulation paused event received")
      setIsPaused(true)
    }

    const handleSimulationResumed = () => {
      console.log("[v0] Simulation resumed event received")
      setIsPaused(false)
    }

    const handleError = (event: CustomEvent) => {
      console.error("[v0] Backend error:", event.detail)
      setError(event.detail.message || "An error occurred")
      setIsRunning(false)
    }

    window.addEventListener("generation_complete", handleGenerationComplete as EventListener)
    window.addEventListener("simulation_started", handleSimulationStarted)
    window.addEventListener("simulation_stopped", handleSimulationStopped)
    window.addEventListener("simulation_paused", handleSimulationPaused)
    window.addEventListener("simulation_resumed", handleSimulationResumed)
    window.addEventListener("error", handleError as EventListener)

    return () => {
      window.removeEventListener("generation_complete", handleGenerationComplete as EventListener)
      window.removeEventListener("simulation_started", handleSimulationStarted)
      window.removeEventListener("simulation_stopped", handleSimulationStopped)
      window.removeEventListener("simulation_paused", handleSimulationPaused)
      window.removeEventListener("simulation_resumed", handleSimulationResumed)
      window.removeEventListener("error", handleError as EventListener)
    }
  }, [])

  const handleStartSimulation = () => {
    console.log("[v0] Starting simulation with population size:", populationSize)
    setGeneration(0)
    setStats(null)
    setStatsHistory([])
    setError(null)
    emit("start_simulation", { population_size: populationSize })
  }

  const handleStopSimulation = () => {
    console.log("[v0] Stopping simulation")
    setError(null)
    emit("stop_simulation")
  }

  const handlePauseSimulation = () => {
    console.log("[v0] Pausing simulation")
    emit("pause_simulation")
  }

  const handleResumeSimulation = () => {
    console.log("[v0] Resuming simulation")
    emit("resume_simulation")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center glow-primary">
              <span className="text-xl font-bold text-white">⚡</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Neuroevolution Playground
              </h1>
              <p className="text-slate-400 mt-1">Watch AI agents evolve through genetic algorithms</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-cyan-400 animate-pulse-glow" : "bg-yellow-500"}`}
            ></div>
            <span className="text-sm text-slate-300">{isConnected ? "Connected (Mock Backend)" : "Connecting..."}</span>
          </div>

          {error && (
            <div className="mt-4 p-4 glass border-red-500/30 rounded-lg text-red-300 text-sm backdrop-blur-xl">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Game Canvas - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl overflow-hidden shadow-2xl glow-primary">
              <GameCanvas isRunning={isRunning} isPaused={isPaused} generation={generation} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Control Panel */}
            <ControlPanel
              isRunning={isRunning}
              isPaused={isPaused}
              isConnected={isConnected}
              populationSize={populationSize}
              onPopulationSizeChange={setPopulationSize}
              onStart={handleStartSimulation}
              onStop={handleStopSimulation}
              onPause={handlePauseSimulation}
              onResume={handleResumeSimulation}
            />

            {/* Stats Panel */}
            <StatsPanel generation={generation} stats={stats} />
          </div>
        </div>

        {/* Analytics Dashboard - Full width */}
        <AnalyticsDashboard statsHistory={statsHistory} />
      </div>
    </main>
  )
}
