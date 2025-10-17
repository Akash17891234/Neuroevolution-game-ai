"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef } from "react"

interface AnalyticsDashboardProps {
  statsHistory: Array<{
    generation: number
    best_fitness: number
    avg_fitness: number
    worst_fitness: number
    population_size: number
  }>
}

function FitnessChart({ statsHistory }: { statsHistory: AnalyticsDashboardProps["statsHistory"] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || statsHistory.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas
    ctx.fillStyle = "#1e293b"
    ctx.fillRect(0, 0, width, height)

    // Find min/max for scaling
    const allValues = statsHistory.flatMap((s) => [s.best_fitness, s.avg_fitness, s.worst_fitness])
    const minValue = Math.min(...allValues, 0)
    const maxValue = Math.max(...allValues, 100)
    const range = maxValue - minValue || 1

    // Draw grid
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      // Y-axis labels
      const value = maxValue - (range / 5) * i
      ctx.fillStyle = "#94a3b8"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(Math.floor(value).toString(), padding - 10, y + 4)
    }

    // Draw axes
    ctx.strokeStyle = "#64748b"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // X-axis labels
    ctx.fillStyle = "#94a3b8"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    const step = Math.ceil(statsHistory.length / 10)
    for (let i = 0; i < statsHistory.length; i += step) {
      const x = padding + (chartWidth / (statsHistory.length - 1 || 1)) * i
      ctx.fillText(statsHistory[i].generation.toString(), x, height - padding + 20)
    }

    // Draw lines
    const drawLine = (dataKey: "best_fitness" | "avg_fitness" | "worst_fitness", color: string) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()

      statsHistory.forEach((stat, index) => {
        const value = stat[dataKey]
        const x = padding + (chartWidth / (statsHistory.length - 1 || 1)) * index
        const y = height - padding - ((value - minValue) / range) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }

    drawLine("best_fitness", "#10b981")
    drawLine("avg_fitness", "#3b82f6")
    drawLine("worst_fitness", "#ef4444")

    // Legend
    const legendY = 20
    const legendItems = [
      { label: "Best Fitness", color: "#10b981" },
      { label: "Avg Fitness", color: "#3b82f6" },
      { label: "Worst Fitness", color: "#ef4444" },
    ]

    legendItems.forEach((item, index) => {
      ctx.fillStyle = item.color
      ctx.fillRect(width - 200 + index * 65, legendY, 10, 10)
      ctx.fillStyle = "#f1f5f9"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(item.label, width - 185 + index * 65, legendY + 10)
    })
  }, [statsHistory])

  return <canvas ref={canvasRef} width={600} height={300} className="w-full border border-slate-700 rounded" />
}

function BestFitnessChart({ statsHistory }: { statsHistory: AnalyticsDashboardProps["statsHistory"] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || statsHistory.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas
    ctx.fillStyle = "#1e293b"
    ctx.fillRect(0, 0, width, height)

    // Find min/max
    const bestValues = statsHistory.map((s) => s.best_fitness)
    const minValue = Math.min(...bestValues, 0)
    const maxValue = Math.max(...bestValues, 100)
    const range = maxValue - minValue || 1

    // Draw grid
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = "#64748b"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw filled area
    ctx.fillStyle = "rgba(16, 185, 129, 0.3)"
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)

    statsHistory.forEach((stat, index) => {
      const x = padding + (chartWidth / (statsHistory.length - 1 || 1)) * index
      const y = height - padding - ((stat.best_fitness - minValue) / range) * chartHeight
      ctx.lineTo(x, y)
    })

    ctx.lineTo(width - padding, height - padding)
    ctx.closePath()
    ctx.fill()

    // Draw line
    ctx.strokeStyle = "#10b981"
    ctx.lineWidth = 2
    ctx.beginPath()

    statsHistory.forEach((stat, index) => {
      const x = padding + (chartWidth / (statsHistory.length - 1 || 1)) * index
      const y = height - padding - ((stat.best_fitness - minValue) / range) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }, [statsHistory])

  return <canvas ref={canvasRef} width={600} height={250} className="w-full border border-slate-700 rounded" />
}

export default function AnalyticsDashboard({ statsHistory }: AnalyticsDashboardProps) {
  if (statsHistory.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Fitness Analytics</CardTitle>
          <CardDescription>Start a simulation to see analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500">No data yet</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fitness Trend Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Fitness Over Generations</CardTitle>
          <CardDescription>Best, average, and worst fitness scores</CardDescription>
        </CardHeader>
        <CardContent>
          <FitnessChart statsHistory={statsHistory} />
        </CardContent>
      </Card>

      {/* Best Fitness Trend */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Best Fitness Progression</CardTitle>
          <CardDescription>Maximum fitness achieved per generation</CardDescription>
        </CardHeader>
        <CardContent>
          <BestFitnessChart statsHistory={statsHistory} />
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Current Best</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {Math.floor(statsHistory[statsHistory.length - 1]?.best_fitness || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Gen {statsHistory[statsHistory.length - 1]?.generation || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Current Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {Math.floor(statsHistory[statsHistory.length - 1]?.avg_fitness || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Population mean</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {statsHistory.length > 1
                ? Math.floor(
                    (((statsHistory[statsHistory.length - 1]?.best_fitness || 0) -
                      (statsHistory[0]?.best_fitness || 0)) /
                      (statsHistory[0]?.best_fitness || 1)) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-slate-500 mt-1">Since generation 0</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-300">{statsHistory.length}</div>
            <p className="text-xs text-slate-500 mt-1">Total completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
