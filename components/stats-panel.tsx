"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsPanelProps {
  generation: number
  stats: any
}

export default function StatsPanel({ generation, stats }: StatsPanelProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Generation Stats</CardTitle>
        <CardDescription>Current population metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Generation</span>
            <span className="text-white font-mono font-bold">{generation}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Best Fitness</span>
            <span className="text-emerald-400 font-mono font-bold">
              {stats?.best_fitness ? Math.floor(stats.best_fitness) : "—"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Avg Fitness</span>
            <span className="text-blue-400 font-mono font-bold">
              {stats?.avg_fitness ? Math.floor(stats.avg_fitness) : "—"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Population</span>
            <span className="text-slate-300 font-mono font-bold">{stats?.population_size || "—"}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pt-2">
          <div className="text-xs text-slate-500 mb-1">Fitness Progress</div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(((stats?.best_fitness || 0) / 1000) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
