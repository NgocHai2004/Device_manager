import React, { useState, useEffect } from 'react'

export interface EpicPlanet {
  id: string | number
  name: string
  code: string
  color: string
  glowColor: string
  radius: number       // Orbit distance from central Earth
  speed: number        // Seconds per full rotation around Earth
  size: number         // Planet diameter in px
  startAngle: number   // Initial angle in degrees
  hasRing?: boolean
  moons: {
    id: string | number
    name: string
    lit: boolean
  }[]
}

interface EarthOrbitSystemProps {
  planets: EpicPlanet[]
  selectedPlanetId: string | number | null
  onSelectPlanet: (planetId: string | number | null) => void
}

export default function EarthOrbitSystem({
  planets,
  selectedPlanetId,
  onSelectPlanet,
}: EarthOrbitSystemProps) {
  const [isRotating, setIsRotating] = useState(true)
  const [hoveredPlanet, setHoveredPlanet] = useState<EpicPlanet | null>(null)
  const [time, setTime] = useState(0)

  // Smooth animation frame for physics/rotation
  useEffect(() => {
    let animId: number
    let lastT = performance.now()

    const tick = (now: number) => {
      const dt = (now - lastT) / 1000
      lastT = now
      if (isRotating) {
        setTime((t) => t + dt)
      }
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [isRotating])

  return (
    <div className="relative w-full h-[440px] md:h-[480px] flex flex-col justify-between overflow-hidden select-none">
      {/* Top action / status inside the orbit box */}
      <div className="relative z-10 flex items-center justify-between px-2 pt-1 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Hệ thống quỹ đạo thời gian thực</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition flex items-center gap-1.5"
            title={isRotating ? 'Tạm dừng quỹ đạo' : 'Tiếp tục quay'}
          >
            {isRotating ? '⏸ Tạm dừng' : '▶ Quay'}
          </button>
          {selectedPlanetId && (
            <button
              onClick={() => onSelectPlanet(null)}
              className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 transition text-xs"
            >
              Xem tất cả
            </button>
          )}
        </div>
      </div>

      {/* Orbit Canvas / 3D Space Center */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Ambient cosmic backdrop glow */}
        <div className="absolute w-[450px] h-[320px] rounded-full bg-indigo-900/20 blur-3xl pointer-events-none" />

        {/* Orbital Elliptical Rings around Central Earth */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="-300 -180 600 360"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="ringGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="ringGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Elliptical paths */}
          <ellipse cx="0" cy="0" rx="140" ry="75" fill="none" stroke="url(#ringGrad1)" strokeWidth="1.2" strokeDasharray="3 4" />
          <ellipse cx="0" cy="0" rx="190" ry="105" fill="none" stroke="url(#ringGrad2)" strokeWidth="1" strokeDasharray="4 6" />
          <ellipse cx="0" cy="0" rx="245" ry="135" fill="none" stroke="url(#ringGrad3)" strokeWidth="1.2" strokeDasharray="3 5" />
          <ellipse cx="0" cy="0" rx="285" ry="155" fill="none" stroke="url(#ringGrad4)" strokeWidth="0.8" strokeDasharray="5 7" />
        </svg>

        {/* Central Earth Globe */}
        <div
          className="relative z-20 flex flex-col items-center group cursor-pointer"
          onClick={() => onSelectPlanet(null)}
          title="Trái Đất Trung Tâm (Tổng thể hệ thống)"
        >
          {/* Outer atmosphere halo */}
          <div className="earth-atmosphere w-24 h-24" />

          {/* Earth Body */}
          <div className="earth-sphere w-20 h-20 md:w-22 md:h-22 relative overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            {/* Continent swirls simulation */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200 via-emerald-400 to-transparent pointer-events-none" />
            <div className="absolute -inset-1 rounded-full border border-cyan-400/30 pointer-events-none animate-pulse" />
            
            {/* Glowing core indicator */}
            <div className="text-center">
              <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">🌍</span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-[11px] font-medium text-cyan-300 shadow-lg backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Earth · Trung tâm QC</span>
          </div>
        </div>

        {/* Orbiting Planets & Moons */}
        {planets.map((p, idx) => {
          // Calculate orbital position on tilted ellipse
          const angleDeg = p.startAngle + (time * 360) / p.speed
          const rad = (angleDeg * Math.PI) / 180

          // Radii match elliptical paths
          const rx = 140 + idx * 48
          const ry = 75 + idx * 28

          const x = Math.cos(rad) * rx
          const y = Math.sin(rad) * ry

          const isSelected = selectedPlanetId === p.id
          const isHovered = hoveredPlanet?.id === p.id
          const litMoonsCount = p.moons.filter((m) => m.lit).length

          return (
            <div
              key={p.id}
              className="absolute z-20 cursor-pointer transition-transform duration-100"
              style={{
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
              }}
              onMouseEnter={() => setHoveredPlanet(p)}
              onMouseLeave={() => setHoveredPlanet(null)}
              onClick={() => onSelectPlanet(isSelected ? null : p.id)}
            >
              {/* Planetary System Container */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: p.size * 2.8, height: p.size * 2.8 }}
              >
                {/* Selection halo */}
                {isSelected && (
                  <div
                    className="absolute inset-0 rounded-full border-2 border-dashed animate-spin pointer-events-none"
                    style={{
                      borderColor: p.color,
                      animationDuration: '10s',
                    }}
                  />
                )}

                {/* Planet Orbit Ring (like Saturn or tilted moon orbit) */}
                {p.hasRing ? (
                  <div
                    className="absolute rounded-full border pointer-events-none"
                    style={{
                      width: p.size * 2.4,
                      height: p.size * 0.9,
                      transform: 'rotate(-25deg)',
                      borderColor: `${p.color}99`,
                      boxShadow: `0 0 12px ${p.glowColor}`,
                    }}
                  />
                ) : (
                  <div
                    className="absolute rounded-full border pointer-events-none"
                    style={{
                      width: p.size * 2.2,
                      height: p.size * 2.2,
                      borderColor: `${p.color}33`,
                    }}
                  />
                )}

                {/* Planet Sphere */}
                <div
                  className="rounded-full relative transition-all duration-300"
                  style={{
                    width: p.size,
                    height: p.size,
                    background: `radial-gradient(circle at 32% 28%, #ffffffdd 0%, ${p.color} 45%, #050410 130%)`,
                    boxShadow: isSelected || isHovered
                      ? `0 0 ${p.size * 0.8}px ${p.color}, 0 0 ${p.size * 1.5}px ${p.glowColor}, inset -4px -4px 10px rgba(0,0,0,0.8)`
                      : `0 0 ${p.size * 0.4}px ${p.color}, 0 0 ${p.size * 0.8}px ${p.glowColor}, inset -4px -4px 10px rgba(0,0,0,0.8)`,
                    transform: isSelected || isHovered ? 'scale(1.15)' : 'scale(1)',
                  }}
                />

                {/* Orbiting Moons / Subtask satellites */}
                {p.moons.map((m, mIdx) => {
                  const moonAngle = (mIdx * (360 / p.moons.length)) + (time * 360) / (7 + mIdx * 2)
                  const moonRad = (moonAngle * Math.PI) / 180
                  const moonDist = p.size * 0.95
                  const mx = Math.cos(moonRad) * moonDist
                  const my = Math.sin(moonRad) * (moonDist * 0.6) // slightly inclined

                  return (
                    <div
                      key={m.id || mIdx}
                      className="absolute rounded-full transition-all duration-300 pointer-events-none"
                      style={{
                        width: m.lit ? 7 : 5,
                        height: m.lit ? 7 : 5,
                        transform: `translate(${mx}px, ${my}px)`,
                        background: m.lit
                          ? '#ffffff'
                          : 'radial-gradient(circle, #94a3b8 30%, #475569 100%)',
                        boxShadow: m.lit
                          ? `0 0 8px #ffffff, 0 0 16px ${p.color}`
                          : 'none',
                        opacity: m.lit ? 1 : 0.45,
                        zIndex: my > 0 ? 30 : 10,
                      }}
                      title={m.name}
                    />
                  )
                })}

                {/* Floating Label / Tag */}
                <div
                  className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all pointer-events-none ${
                    isSelected
                      ? 'bg-white/20 text-white border border-white/30 backdrop-blur-md scale-105'
                      : 'bg-black/60 text-white/70 border border-white/10'
                  }`}
                >
                  {p.name} ({litMoonsCount}/{p.moons.length})
                </div>
              </div>
            </div>
          )
        })}

        {/* Hovered Planet Tooltip HUD */}
        {hoveredPlanet && (
          <div className="absolute top-3 left-4 z-30 p-3 rounded-xl bg-slate-900/90 border border-white/20 backdrop-blur-xl shadow-2xl pointer-events-none min-w-[200px] animate-fadeIn">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: hoveredPlanet.color }}
              />
              <span className="font-semibold text-sm text-white">{hoveredPlanet.name}</span>
            </div>
            <div className="mt-2 text-xs text-white/70 flex justify-between">
              <span>Tiến độ vệ tinh:</span>
              <span className="text-amber-300 font-bold">
                {hoveredPlanet.moons.filter((m) => m.lit).length} / {hoveredPlanet.moons.length} hoàn thành
              </span>
            </div>
            <div className="mt-1.5 w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${
                    hoveredPlanet.moons.length > 0
                      ? Math.round(
                          (hoveredPlanet.moons.filter((m) => m.lit).length /
                            hoveredPlanet.moons.length) *
                            100
                        )
                      : 0
                  }%`,
                  backgroundColor: hoveredPlanet.color,
                }}
              />
            </div>
            <div className="mt-2 text-[10px] text-white/50 italic">
              Nhấp để lọc danh sách công việc của hành tinh này
            </div>
          </div>
        )}
      </div>

      {/* Bottom Legend Chips - Matching the Screenshot Style */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-3 pb-1 border-t border-white/5">
        {planets.map((p) => {
          const litCount = p.moons.filter((m) => m.lit).length
          const isSelected = selectedPlanetId === p.id
          return (
            <button
              key={p.id}
              onClick={() => onSelectPlanet(isSelected ? null : p.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-white/20 text-white border border-white/40 shadow-lg scale-105'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full transition-transform"
                style={{
                  backgroundColor: p.color,
                  boxShadow: `0 0 8px ${p.color}`,
                }}
              />
              <span>{p.name}</span>
              <span className="text-white/40 text-[11px]">
                {litCount}/{p.moons.length}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
