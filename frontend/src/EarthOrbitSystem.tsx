import { useState, useEffect } from 'react'

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

export interface EarthOrbitSystemProps {
  planets: EpicPlanet[]
  selectedPlanetId?: string | number | null
  onSelectPlanet?: (planetId: string | number | null) => void
  onOpenProject?: (planetId: string | number) => void
  onNewProject?: () => void
}

export default function EarthOrbitSystem({
  planets,
  selectedPlanetId = null,
  onSelectPlanet,
  onOpenProject,
  onNewProject,
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

  const handlePlanetClick = (planetId: string | number) => {
    if (onOpenProject) {
      onOpenProject(planetId)
    } else {
      window.location.hash = `#/p/${planetId}`
    }
  }

  return (
    <div className="relative w-full h-[460px] md:h-[500px] flex flex-col justify-between overflow-hidden select-none">
      {/* Top action / status inside the orbit box */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-medium text-white/80">Hệ thống quỹ đạo thời gian thực</span>
          <span className="text-white/40 hidden sm:inline">· Nhấp vào hành tinh để vào dự án</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition flex items-center gap-1.5"
            title={isRotating ? 'Tạm dừng quỹ đạo' : 'Tiếp tục quay'}
          >
            {isRotating ? '⏸ Tạm dừng' : '▶ Quay'}
          </button>
          {selectedPlanetId && onSelectPlanet && (
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
        <div className="absolute w-[500px] h-[340px] rounded-full bg-indigo-900/20 blur-3xl pointer-events-none" />

        {/* Orbital Elliptical Rings around Central Earth */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="-350 -200 700 400"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {planets.map((p, idx) => (
              <linearGradient
                key={`grad-${p.id || idx}`}
                id={`ringGrad-${p.id || idx}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={p.color} stopOpacity="0.4" />
                <stop offset="50%" stopColor={p.glowColor || p.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={p.color} stopOpacity="0.05" />
              </linearGradient>
            ))}
          </defs>

          {/* Elliptical paths */}
          {planets.map((p, idx) => {
            const rx = 145 + idx * 46
            const ry = 75 + idx * 24
            return (
              <ellipse
                key={`ellipse-${p.id || idx}`}
                cx="0"
                cy="0"
                rx={rx}
                ry={ry}
                fill="none"
                stroke={`url(#ringGrad-${p.id || idx})`}
                strokeWidth="1.2"
                strokeDasharray="4 6"
              />
            )
          })}
        </svg>

        {/* Central Earth Globe */}
        <div
          className="relative z-20 flex flex-col items-center group cursor-pointer"
          onClick={() => onSelectPlanet && onSelectPlanet(null)}
          title="Trái Đất Trung Tâm · QC Workspace Hub"
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
          const rx = 145 + idx * 46
          const ry = 75 + idx * 24

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
              onClick={() => handlePlanetClick(p.id)}
            >
              {/* Planetary System Container */}
              <div
                className="relative flex items-center justify-center group"
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

                {/* Planet Orbit Ring (Saturn ring / tilted orbit) */}
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
                    transform: isSelected || isHovered ? 'scale(1.2)' : 'scale(1)',
                  }}
                />

                {/* Orbiting Moons / Feature satellites */}
                {p.moons.map((m, mIdx) => {
                  const ringLayer = mIdx % 2 === 0 ? 1 : 1.3
                  const moonAngle =
                    (mIdx * (360 / p.moons.length)) + (time * 360) / (7 + (mIdx % 3) * 2)
                  const moonRad = (moonAngle * Math.PI) / 180
                  const moonDist = p.size * (0.95 * ringLayer)
                  const mx = Math.cos(moonRad) * moonDist
                  const my = Math.sin(moonRad) * (moonDist * 0.6)

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
                    isSelected || isHovered
                      ? 'bg-white/20 text-white border border-white/30 backdrop-blur-md scale-105 shadow-lg'
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
          <div
            onClick={() => handlePlanetClick(hoveredPlanet.id)}
            className="absolute top-4 left-4 z-30 p-3.5 rounded-xl bg-slate-900/95 border border-white/20 backdrop-blur-xl shadow-2xl cursor-pointer min-w-[220px] transition-all hover:border-amber-400/50"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: hoveredPlanet.color }}
                />
                <span className="font-semibold text-sm text-white">{hoveredPlanet.name}</span>
              </div>
              <span className="text-[10px] text-white/40">#{hoveredPlanet.code}</span>
            </div>
            
            <div className="mt-2 text-xs text-white/70 flex justify-between">
              <span>Tiến độ tính năng:</span>
              <span className="text-amber-300 font-bold">
                {hoveredPlanet.moons.filter((m) => m.lit).length} / {hoveredPlanet.moons.length} xong
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
            
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300 font-medium">
              <span>Vào xem chi tiết dự án</span>
              <span>→</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Legend Chips - Matching TRANSOM style */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 pb-2 border-t border-white/5 px-4 bg-black/20">
        <div className="flex flex-wrap items-center gap-2">
          {planets.map((p) => {
            const litCount = p.moons.filter((m) => m.lit).length
            const isSelected = selectedPlanetId === p.id
            return (
              <button
                key={p.id}
                onClick={() => handlePlanetClick(p.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white/20 text-white border border-white/40 shadow-lg scale-105'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
                title="Nhấp để vào dự án này"
              >
                <span
                  className="w-2 h-2 rounded-full transition-transform"
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
        {onNewProject && (
          <button
            onClick={onNewProject}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition"
          >
            <span>+ Tạo dự án mới</span>
          </button>
        )}
      </div>
    </div>
  )
}
