"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseWebSocketOptions {
  url?: string
  autoConnect?: boolean
  useMockBackend?: boolean
}

// Simple neural network for agents
class SimpleNN {
  weights: number[][]
  biases: number[]

  constructor() {
    // 3 inputs (position, distance_to_edge, speed) -> 2 hidden -> 2 outputs (steer, accelerate)
    this.weights = [
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
    ]
    this.biases = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]
  }

  predict(inputs: number[]): number[] {
    // Simple feedforward
    const hidden = [
      Math.tanh(
        inputs[0] * this.weights[0][0] +
          inputs[1] * this.weights[0][1] +
          inputs[2] * this.weights[0][2] +
          this.biases[0],
      ),
      Math.tanh(
        inputs[0] * this.weights[1][0] +
          inputs[1] * this.weights[1][1] +
          inputs[2] * this.weights[1][2] +
          this.biases[1],
      ),
    ]
    const output = [
      Math.tanh(hidden[0] * this.weights[2][0] + hidden[1] * this.weights[2][1] + this.biases[2]),
      Math.tanh(hidden[0] * this.weights[3][0] + hidden[1] * this.weights[3][1] + this.biases[3]),
    ]
    return output
  }

  clone(): SimpleNN {
    const clone = new SimpleNN()
    clone.weights = this.weights.map((w) => [...w])
    clone.biases = [...this.biases]
    return clone
  }

  mutate(rate = 0.1): void {
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        if (Math.random() < rate) {
          this.weights[i][j] += (Math.random() - 0.5) * 0.5
        }
      }
    }
    for (let i = 0; i < this.biases.length; i++) {
      if (Math.random() < rate) {
        this.biases[i] += (Math.random() - 0.5) * 0.5
      }
    }
  }
}

interface Agent {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  fitness: number
  alive: boolean
  nn: SimpleNN
  color: string
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { url = "http://localhost:5000", autoConnect = true, useMockBackend = true } = options
  const socketRef = useRef<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const eventListenersRef = useRef<Map<string, Set<Function>>>(new Map())
  const mockSimulationRef = useRef<any>(null)

  useEffect(() => {
    if (!autoConnect) return

    try {
      if (useMockBackend) {
        console.log("[v0] Using mock backend for local development")
        setIsConnected(true)
        setError(null)

        socketRef.current = {
          connected: true,
          on: (event: string, callback: Function) => {
            if (!eventListenersRef.current.has(event)) {
              eventListenersRef.current.set(event, new Set())
            }
            eventListenersRef.current.get(event)?.add(callback)
          },
          off: (event: string, callback?: Function) => {
            if (callback) {
              eventListenersRef.current.get(event)?.delete(callback)
            } else {
              eventListenersRef.current.delete(event)
            }
          },
          emit: (event: string, data?: any) => {
            console.log("[v0] Mock emit:", event, data)
          },
          disconnect: () => {
            setIsConnected(false)
          },
        }

        return
      }

      setIsConnected(false)
      setError("Backend server not available. Using mock mode.")
    } catch (err) {
      console.error("[v0] Failed to initialize WebSocket:", err)
      setError("Failed to initialize connection")
    }
  }, [url, autoConnect, useMockBackend])

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      console.log("[v0] Emitting event:", event, data)
      socketRef.current.emit(event, data)

      if (event === "start_simulation") {
        console.log("[v0] Starting mock simulation")

        // Emit simulation started via window event
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("simulation_started"))
        }, 100)

        // Initialize simulation
        const populationSize = data?.population_size || 50
        const agents: Agent[] = []
        const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#ffa07a", "#98d8c8", "#f7dc6f", "#bb8fce", "#85c1e2"]

        for (let i = 0; i < populationSize; i++) {
          agents.push({
            id: i,
            x: 400 + (Math.random() - 0.5) * 100,
            y: 50,
            vx: 0,
            vy: 2,
            fitness: 0,
            alive: true,
            nn: new SimpleNN(),
            color: colors[i % colors.length],
          })
        }

        let generation = 0
        let frameCount = 0
        const trackWidth = 150
        const trackX = 300
        const trackLength = 600

        const simulationInterval = setInterval(() => {
          if (!mockSimulationRef.current?.running) {
            clearInterval(simulationInterval)
            return
          }

          if (mockSimulationRef.current?.paused) {
            return
          }

          frameCount++

          // Update agents
          agents.forEach((agent) => {
            if (!agent.alive) return

            // Calculate inputs
            const distanceToLeftEdge = agent.x - trackX
            const distanceToRightEdge = trackX + trackWidth - agent.x
            const minDistanceToEdge = Math.min(distanceToLeftEdge, distanceToRightEdge)
            const inputs = [agent.x / 800, minDistanceToEdge / 100, agent.vy / 10]

            // Get neural network output
            const output = agent.nn.predict(inputs)
            const steer = output[0]
            const accelerate = output[1]

            // Update position
            agent.vx = steer * 3
            agent.vy += accelerate * 0.2
            agent.vy = Math.min(agent.vy, 5)

            agent.x += agent.vx
            agent.y += agent.vy

            // Check if on track
            if (agent.x < trackX || agent.x > trackX + trackWidth) {
              agent.alive = false
            }

            // Check if finished
            if (agent.y > trackLength) {
              agent.alive = false
              agent.fitness = trackLength + 100
            } else if (agent.alive) {
              agent.fitness = agent.y
            }
          })

          const agentUpdates = agents.map((a) => ({
            id: a.id,
            x: a.x,
            y: a.y,
            alive: a.alive,
            fitness: a.fitness,
            color: a.color,
          }))

          const listeners = eventListenersRef.current.get("agent_update")
          if (listeners && listeners.size > 0) {
            console.log("[v0] Sending agent update to", listeners.size, "listeners")
            listeners.forEach((cb) => cb({ agents: agentUpdates, generation }))
          }

          // Check if generation is complete
          if (frameCount > 200 || agents.every((a) => !a.alive)) {
            generation++
            frameCount = 0

            // Calculate stats
            const fitnesses = agents.map((a) => a.fitness)
            const bestFitness = Math.max(...fitnesses)
            const avgFitness = fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length
            const worstFitness = Math.min(...fitnesses)

            console.log(
              `[v0] Generation ${generation} complete - Best: ${bestFitness.toFixed(2)}, Avg: ${avgFitness.toFixed(2)}`,
            )

            window.dispatchEvent(
              new CustomEvent("generation_complete", {
                detail: {
                  generation,
                  best_fitness: bestFitness,
                  avg_fitness: avgFitness,
                  worst_fitness: worstFitness,
                  population_size: populationSize,
                },
              }),
            )

            // Genetic algorithm: selection, crossover, mutation
            const sortedAgents = [...agents].sort((a, b) => b.fitness - a.fitness)
            const topAgents = sortedAgents.slice(0, Math.ceil(populationSize * 0.2))

            const newAgents: Agent[] = []
            for (let i = 0; i < populationSize; i++) {
              const parent = topAgents[Math.floor(Math.random() * topAgents.length)]
              const newAgent: Agent = {
                id: i,
                x: 400 + (Math.random() - 0.5) * 100,
                y: 50,
                vx: 0,
                vy: 2,
                fitness: 0,
                alive: true,
                nn: parent.nn.clone(),
                color: parent.color,
              }
              newAgent.nn.mutate(0.15)
              newAgents.push(newAgent)
            }

            agents.length = 0
            agents.push(...newAgents)
          }
        }, 50)

        mockSimulationRef.current = { running: true, paused: false, interval: simulationInterval }
      } else if (event === "stop_simulation") {
        console.log("[v0] Stopping mock simulation")
        if (mockSimulationRef.current?.interval) {
          clearInterval(mockSimulationRef.current.interval)
        }
        mockSimulationRef.current = { running: false, paused: false }

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("simulation_stopped"))
        }, 100)
      } else if (event === "pause_simulation") {
        console.log("[v0] Pausing simulation")
        if (mockSimulationRef.current) {
          mockSimulationRef.current.paused = true
        }
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("simulation_paused"))
        }, 100)
      } else if (event === "resume_simulation") {
        console.log("[v0] Resuming simulation")
        if (mockSimulationRef.current) {
          mockSimulationRef.current.paused = false
        }
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("simulation_resumed"))
        }, 100)
      }
    } else {
      console.warn("[v0] Socket not connected, cannot emit:", event)
    }
  }, [])

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!eventListenersRef.current.has(event)) {
      eventListenersRef.current.set(event, new Set())
    }
    eventListenersRef.current.get(event)?.add(callback)
    console.log(
      "[v0] Registered listener for event:",
      event,
      "Total listeners:",
      eventListenersRef.current.get(event)?.size,
    )
  }, [])

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (callback) {
      eventListenersRef.current.get(event)?.delete(callback)
    } else {
      eventListenersRef.current.delete(event)
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    error,
    reconnectAttempts,
    emit,
    on,
    off,
  }
}
