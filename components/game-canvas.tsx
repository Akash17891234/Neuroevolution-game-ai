"use client"

import { useEffect, useRef, useState } from "react"

interface Agent {
  id: number
  x: number
  y: number
  alive: boolean
  fitness: number
  color: string
  speed: number
}

export default function GameCanvas({
  isRunning,
  isPaused,
  generation,
}: { isRunning: boolean; isPaused: boolean; generation: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const agentsRef = useRef<Agent[]>([])
  const animationRef = useRef<number>(0)
  const [connectionStatus, setConnectionStatus] = useState("connected")

  const generateAgents = (gen: number) => {
    const agents: Agent[] = []
    const populationSize = 50
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

    for (let i = 0; i < populationSize; i++) {
      const baseSpeed = 1 + gen * 0.1 // Speed increases with generation
      const variance = Math.sin(i * 0.5 + gen) * 0.5
      agents.push({
        id: i,
        x: 375, // Center of track
        y: -50 - i * 15, // Start above canvas, staggered
        alive: Math.random() > 0.1, // 90% alive
        fitness: Math.floor(Math.random() * 700 + gen * 50),
        color: colors[i % colors.length],
        speed: baseSpeed + variance,
      })
    }
    return agents
  }

  const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const TRACK_X = 300
    const TRACK_WIDTH = 150
    const AGENT_SIZE = 8

    // Background
    ctx.fillStyle = "#0F172A"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw track
    ctx.fillStyle = "#1E293B"
    ctx.fillRect(TRACK_X, 0, TRACK_WIDTH, canvas.height)

    // Draw track edges
    ctx.strokeStyle = "#64748B"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(TRACK_X, 0)
    ctx.lineTo(TRACK_X, canvas.height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(TRACK_X + TRACK_WIDTH, 0)
    ctx.lineTo(TRACK_X + TRACK_WIDTH, canvas.height)
    ctx.stroke()

    // Draw center line
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 1
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(TRACK_X + TRACK_WIDTH / 2, 0)
    ctx.lineTo(TRACK_X + TRACK_WIDTH / 2, canvas.height)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw agents
    agentsRef.current.forEach((agent) => {
      if (agent.alive) {
        // Draw agent as square
        ctx.fillStyle = agent.color
        ctx.fillRect(agent.x - AGENT_SIZE / 2, agent.y - AGENT_SIZE / 2, AGENT_SIZE, AGENT_SIZE)

        // Draw fitness indicator
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "10px monospace"
        ctx.textAlign = "left"
        ctx.fillText(Math.floor(agent.fitness).toString(), agent.x + 12, agent.y + 3)
      } else {
        // Draw crashed agent as X
        ctx.strokeStyle = agent.color
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.moveTo(agent.x - AGENT_SIZE / 2, agent.y - AGENT_SIZE / 2)
        ctx.lineTo(agent.x + AGENT_SIZE / 2, agent.y + AGENT_SIZE / 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(agent.x + AGENT_SIZE / 2, agent.y - AGENT_SIZE / 2)
        ctx.lineTo(agent.x - AGENT_SIZE / 2, agent.y + AGENT_SIZE / 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })

    // Draw generation counter
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 16px monospace"
    ctx.textAlign = "left"
    ctx.fillText(`Generation: ${generation}`, 20, 30)

    // Draw active agents counter
    const activeAgents = agentsRef.current.filter((a) => a.alive).length
    ctx.fillText(`Active: ${activeAgents}/${agentsRef.current.length}`, 20, 55)

    // Draw status
    const statusColor = connectionStatus === "connected" ? "#10B981" : "#EF4444"
    ctx.fillStyle = statusColor
    ctx.beginPath()
    ctx.arc(canvas.width - 30, 30, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#FFFFFF"
    ctx.font = "12px monospace"
    ctx.textAlign = "right"
    ctx.fillText(isRunning ? "Running" : "Stopped", canvas.width - 50, 35)
  }

  useEffect(() => {
    agentsRef.current = generateAgents(generation)
  }, [generation])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let frameCount = 0

    const animate = () => {
      frameCount++

      if (isRunning && !isPaused) {
        agentsRef.current.forEach((agent) => {
          if (agent.alive) {
            agent.y += agent.speed
            // Add slight horizontal movement for variation
            agent.x += Math.sin(frameCount * 0.02 + agent.id) * 0.5
            // Keep agent in track bounds
            agent.x = Math.max(310, Math.min(435, agent.x))
            // Mark as dead if off screen
            if (agent.y > canvas.height) {
              agent.alive = false
            }
          }
        })
      }

      draw(canvas, ctx)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, isPaused])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-96 lg:h-[600px] border border-slate-700 rounded-lg bg-slate-950" />
    </div>
  )
}
