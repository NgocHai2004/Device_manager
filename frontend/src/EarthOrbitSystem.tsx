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
    color?: string
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

  // SVG Universe Dimensions
  const viewBoxW = 960
  const viewBoxH = 500
  const cx = 480
  const cy = 250

  // Calculate coordinates for all planets strictly along their orbits
  const calculatedPlanets = planets.map((p, idx) => {
    const rx = 135 + idx * 56
    const ry = 70 + idx * 28

    const angleDeg = p.startAngle + (time * 360) / p.speed
    const rad = (angleDeg * Math.PI) / 180

    // Planet center coordinates: MATHEMATICALLY 100% ON THE ELLIPSE
    const px = cx + rx * Math.cos(rad)
    const py = cy + ry * Math.sin(rad)

    const isBehind = Math.sin(rad) < 0
    const isSelected = selectedPlanetId === p.id
    const isHovered = hoveredPlanet?.id === p.id

    // Moon parameters
    const moonLayers = [
      { mRx: p.size * 0.9, mRy: p.size * 0.45, speedFactor: 1 },
      { mRx: p.size * 1.35, mRy: p.size * 0.65, speedFactor: 0.7 },
    ]

    const calculatedMoons = p.moons.map((m, mIdx) => {
      const layer = moonLayers[mIdx % 2]
      const moonAngle =
        (mIdx * (360 / Math.max(p.moons.length, 1))) +
        (time * 360 * layer.speedFactor) / (6 + (mIdx % 3) * 2)
      const moonRad = (moonAngle * Math.PI) / 180

      // Moon center coordinates: MATHEMATICALLY 100% ON THE MOON'S MINI-ELLIPSE
      const mx = px + layer.mRx * Math.cos(moonRad)
      const my = py + layer.mRy * Math.sin(moonRad)
      const moonBehind = Math.sin(moonRad) < 0

      return {
        ...m,
        mx,
        my,
        layer,
        moonBehind,
        color: m.color || p.color,
      }
    })

    return {
      ...p,
      rx,
      ry,
      px,
      py,
      isBehind,
      isSelected,
      isHovered,
      calculatedMoons,
      moonLayers,
    }
  })

  // Separate planets behind and in front of Earth for realistic depth
  const planetsBehind = calculatedPlanets.filter((p) => p.isBehind)
  const planetsInFront = calculatedPlanets.filter((p) => !p.isBehind)

  // Render a single planet with its rings, moons and label
  const renderPlanet = (p: (typeof calculatedPlanets)[0]) => {
    const litMoonsCount = p.moons.filter((m) => m.lit).length
    const moonsBehind = p.calculatedMoons.filter((m) => m.moonBehind)
    const moonsInFront = p.calculatedMoons.filter((m) => !m.moonBehind)

    return (
      <g
        key={p.id}
        className="cursor-pointer transition-opacity"
        onMouseEnter={() => setHoveredPlanet(p)}
        onMouseLeave={() => setHoveredPlanet(null)}
        onClick={() => handlePlanetClick(p.id)}
      >
        {/* Mini-orbit elliptical tracks around planet */}
        {p.moonLayers.map((layer, lIdx) => (
          <ellipse
            key={lIdx}
            cx={p.px}
            cy={p.py}
            rx={layer.mRx}
            ry={layer.mRy}
            fill="none"
            stroke={p.color}
            strokeOpacity={p.isHovered ? 0.45 : 0.22}
            strokeDasharray="2 3"
            strokeWidth="0.8"
          />
        ))}

        {/* Moons behind planet */}
        {moonsBehind.map((m, mIdx) => {
          const mColor = m.color || p.color
          return (
            <g key={m.id || mIdx}>
              {m.lit ? (
                <>
                  {/* Pulsing colored ring */}
                  <circle
                    cx={m.mx}
                    cy={m.my}
                    r={3}
                    fill="none"
                    stroke={mColor}
                    strokeWidth="0.8"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      values="3;8;3"
                      dur={`${2 + (mIdx % 3)}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.1;0.8"
                      dur={`${2 + (mIdx % 3)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Radiant colored aura in exact planet color */}
                  <circle
                    cx={m.mx}
                    cy={m.my}
                    r={3.8}
                    fill={mColor}
                    filter={`url(#moonGlow-${p.id})`}
                    opacity="1"
                  />
                  {/* Bright center core */}
                  <circle
                    cx={m.mx}
                    cy={m.my}
                    r={2.2}
                    fill="#ffffff"
                    stroke={mColor}
                    strokeWidth="0.6"
                  />
                </>
              ) : (
                <circle
                  cx={m.mx}
                  cy={m.my}
                  r={2}
                  fill="#334155"
                  stroke="#475569"
                  strokeWidth="0.5"
                  opacity="0.4"
                />
              )}
            </g>
          )
        })}

        {/* Planet Saturn Ring (Back part) */}
        {p.hasRing && (
          <ellipse
            cx={p.px}
            cy={p.py}
            rx={p.size * 0.95}
            ry={p.size * 0.35}
            transform={`rotate(-25 ${p.px} ${p.py})`}
            fill="none"
            stroke={p.color}
            strokeOpacity="0.4"
            strokeWidth="2.5"
          />
        )}

        {/* Planet Sphere */}
        <circle
          cx={p.px}
          cy={p.py}
          r={p.size / 2}
          fill={`url(#planetGrad-${p.id})`}
          filter={p.isSelected || p.isHovered ? 'url(#planetGlowActive)' : 'url(#planetGlow)'}
          stroke={p.color}
          strokeWidth={p.isSelected ? 2 : 1}
          strokeOpacity={p.isSelected ? 0.9 : 0.4}
        />

        {/* Planet Saturn Ring (Front part) */}
        {p.hasRing && (
          <ellipse
            cx={p.px}
            cy={p.py}
            rx={p.size * 0.95}
            ry={p.size * 0.35}
            transform={`rotate(-25 ${p.px} ${p.py})`}
            fill="none"
            stroke={p.color}
            strokeOpacity="0.85"
            strokeWidth="1.8"
            strokeDasharray="18 45"
          />
        )}

        {/* Moons in front of planet */}
        {moonsInFront.map((m, mIdx) => {
          const mColor = m.color || p.color
          return (
            <g key={m.id || mIdx}>
              {m.lit ? (
                <>
                  {/* Pulsing colored ring */}
                  <circle
                    cx={m.mx}
                    cy={m.my}
                    r={3.5}
                    fill="none"
                    stroke={mColor}
                    strokeWidth="1"
                    opacity="0.85"
                  >
                    <animate
                      attributeName="r"
                      values="3.5;9;3.5"
                      dur={`${2 + (mIdx % 3)}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.9;0.1;0.9"
                      dur={`${2 + (mIdx % 3)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Radiant colored aura in exact planet color */}
                  <circle
                    cx={m.mx}
                    cy={m.my}
                    r={4.5}
                    fill={mColor}
                    filter={`url(#moonGlow-${p.id})`}
                    opacity="1"
                  />
                  {/* Bright center core */}
                  <circle
                    cx={m.mx}
                    cy={m.my}
                    r={2.6}
                    fill="#ffffff"
                    stroke={mColor}
                    strokeWidth="0.8"
                  />
                </>
              ) : (
                <circle
                  cx={m.mx}
                  cy={m.my}
                  r={2.3}
                  fill="#475569"
                  stroke="#64748b"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              )}
            </g>
          )
        })}

        {/* Planet Tag Label */}
        <g transform={`translate(${p.px}, ${p.py + p.size / 2 + 13})`} className="pointer-events-none">
          <rect
            x={-p.name.length * 3.4 - 18}
            y={-8}
            width={p.name.length * 6.8 + 36}
            height={16}
            rx={8}
            fill={p.isHovered || p.isSelected ? 'rgba(30, 27, 75, 0.9)' : 'rgba(10, 6, 25, 0.75)'}
            stroke={p.color}
            strokeWidth={p.isHovered ? 1.2 : 0.6}
            strokeOpacity={p.isHovered ? 0.8 : 0.3}
          />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight={p.isHovered ? 'bold' : 'normal'}
            fontFamily="system-ui, sans-serif"
          >
            {p.name} ({litMoonsCount}/{p.moons.length})
          </text>
        </g>
      </g>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-slate-950/40">
      {/* Top action / status inside the orbit box */}
      <div className="relative z-10 shrink-0 flex items-center justify-between px-4 pt-2.5 pb-1 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-medium text-white/80">Hệ thống quỹ đạo thời gian thực</span>
          <span className="text-white/40 hidden sm:inline">· Tinh cầu sáng theo màu dự án khi hoàn thành</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="px-2.5 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition flex items-center gap-1.5 text-xs"
            title={isRotating ? 'Tạm dừng quỹ đạo' : 'Tiếp tục quay'}
          >
            {isRotating ? '⏸ Tạm dừng' : '▶ Quay'}
          </button>
          {selectedPlanetId && onSelectPlanet && (
            <button
              onClick={() => onSelectPlanet(null)}
              className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 transition text-xs"
            >
              Xem tất cả
            </button>
          )}
        </div>
      </div>

      {/* Orbit Canvas: 100% SVG coordinate system ensures EVERY body is on its track */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
        {/* Ambient cosmic nebula glow */}
        <div className="absolute w-[500px] h-[280px] rounded-full bg-indigo-900/25 blur-3xl pointer-events-none" />

        <svg
          viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Planet Radial Gradients with 3D Spherical Lighting */}
            {planets.map((p) => (
              <radialGradient
                key={`grad-${p.id}`}
                id={`planetGrad-${p.id}`}
                cx="32%"
                cy="28%"
                r="70%"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="25%" stopColor={p.color} stopOpacity="0.9" />
                <stop offset="70%" stopColor={p.color} stopOpacity="0.5" />
                <stop offset="100%" stopColor="#05030e" stopOpacity="0.95" />
              </radialGradient>
            ))}

            {/* Exact-Color Glow Filters for Each Planet's Moons */}
            {planets.map((p) => (
              <filter
                key={`moonGlow-${p.id}`}
                id={`moonGlow-${p.id}`}
                x="-150%"
                y="-150%"
                width="400%"
                height="400%"
              >
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={p.color} floodOpacity="0.95" />
                <feDropShadow dx="0" dy="0" stdDeviation="6.5" floodColor={p.color} floodOpacity="0.75" />
              </filter>
            ))}

            {/* Earth Center Radial Gradient */}
            <radialGradient id="earthGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#0284c7" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#047857" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </radialGradient>

            {/* Glow Filter for Planets */}
            <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="planetGlowActive" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. VISIBLE CONTINUOUS ORBITAL TRACKS */}
          {calculatedPlanets.map((p, idx) => (
            <ellipse
              key={`orbit-${p.id || idx}`}
              cx={cx}
              cy={cy}
              rx={p.rx}
              ry={p.ry}
              fill="none"
              stroke={p.color}
              strokeOpacity={p.isHovered ? 0.6 : 0.25}
              strokeWidth={p.isHovered ? 1.6 : 1.1}
              strokeDasharray={p.isHovered ? 'none' : '4 5'}
            />
          ))}

          {/* 2. Planets passing behind Earth */}
          {planetsBehind.map(renderPlanet)}

          {/* 3. Central Earth Globe */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectPlanet && onSelectPlanet(null)}
          >
            {/* Atmosphere Halo Ring */}
            <circle cx={cx} cy={cy} r={38} fill="none" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="2">
              <animate attributeName="r" values="36;42;36" dur="3s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
            </circle>

            {/* Earth Core Body */}
            <circle
              cx={cx}
              cy={cy}
              r={26}
              fill="url(#earthGrad)"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeOpacity="0.7"
              filter="url(#planetGlowActive)"
            />

            {/* Continent Swirl Simulation */}
            <circle cx={cx - 6} cy={cy - 4} r={12} fill="#10b981" opacity="0.35" />
            <circle cx={cx + 8} cy={cy + 6} r={9} fill="#34d399" opacity="0.25" />

            {/* Center Earth Icon */}
            <text
              x={cx}
              y={cy + 5}
              textAnchor="middle"
              fontSize="16"
              className="pointer-events-none select-none"
            >
              🌍
            </text>

            {/* Central Earth Badge */}
            <g transform={`translate(${cx}, ${cy + 38})`}>
              <rect
                x={-52}
                y={-8}
                width={104}
                height={16}
                rx={8}
                fill="rgba(15, 23, 42, 0.85)"
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
              <text
                x={0}
                y={3.5}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="9"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                Earth · Trung tâm QC
              </text>
            </g>
          </g>

          {/* 4. Planets passing in front of Earth */}
          {planetsInFront.map(renderPlanet)}
        </svg>

        {/* Hovered Planet Tooltip HUD Card */}
        {hoveredPlanet && (
          <div
            onClick={() => handlePlanetClick(hoveredPlanet.id)}
            className="absolute top-3 left-4 z-30 p-3 rounded-xl bg-slate-900/95 border border-amber-400/50 backdrop-blur-xl shadow-2xl cursor-pointer min-w-[210px] transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: hoveredPlanet.color }}
                />
                <span className="font-semibold text-xs text-white">{hoveredPlanet.name}</span>
              </div>
              <span className="text-[10px] text-white/40">#{hoveredPlanet.code}</span>
            </div>

            <div className="mt-1.5 text-[11px] text-white/70 flex justify-between">
              <span>Tiến độ tính năng:</span>
              <span className="text-amber-300 font-bold">
                {hoveredPlanet.moons.filter((m) => m.lit).length} / {hoveredPlanet.moons.length} hoàn thành
              </span>
            </div>

            <div className="mt-1 w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
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

            <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-300 font-semibold">
              <span>Vào xem chi tiết dự án</span>
              <span>→</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Legend Chips */}
      <div className="relative z-10 shrink-0 flex flex-wrap items-center justify-between gap-2 py-1.5 px-4 border-t border-white/5 bg-black/30">
        <div className="flex flex-wrap items-center gap-2">
          {planets.map((p) => {
            const litCount = p.moons.filter((m) => m.lit).length
            const isSelected = selectedPlanetId === p.id
            return (
              <button
                key={p.id}
                onClick={() => handlePlanetClick(p.id)}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
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
                    boxShadow: `0 0 6px ${p.color}`,
                  }}
                />
                <span className="text-[11px]">{p.name}</span>
                <span className="text-white/40 text-[10px]">
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
