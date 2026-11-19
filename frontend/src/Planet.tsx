import type { CSSProperties } from 'react'

interface Moon {
  lit: boolean
}

interface PlanetProps {
  color: string
  size?: number
  moons?: Moon[]
}

/** Glowing CSS planet sphere with tilted orbit ring and orbiting moons. */
export default function Planet({ color, size = 96, moons = [] }: PlanetProps) {
  const ringR = size * 0.75
  return (
    <div style={{ width: size * 2.4, height: size * 2.4, position: 'relative' }} className="shrink-0">
      <div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          left: '50%',
          top: '50%',
          margin: -size / 2,
          background: `radial-gradient(circle at 32% 30%, #ffffffcc, ${color} 45%, #000 130%)`,
          boxShadow: `0 0 ${size / 3}px ${color}, 0 0 ${size}px ${color}66, inset -${size / 8}px -${size / 10}px ${size / 4}px #00000066`,
        }}
      />
      {/* orbit ring */}
      <div
        className="planet-orbit absolute rounded-full border"
        style={{
          width: size * 2.3,
          height: size * 2.3,
          left: '50%',
          top: '50%',
          margin: -(size * 2.3) / 2,
          borderColor: `${color}55`,
        }}
      />
      {/* moons */}
      {moons.map((m, i) => (
        <span
          key={i}
          className="moon rounded-full"
          style={
            {
              '--r': `${ringR}px`,
              animationDuration: `${6 + i * 1.7}s`,
              animationDelay: `${-i * 2.2}s`,
              width: size * 0.14,
              height: size * 0.14,
              margin: -(size * 0.14) / 2,
              background: m.lit
                ? 'radial-gradient(circle at 30% 30%, #fff, #f6f3ff 40%, #c9c2ff)'
                : 'radial-gradient(circle at 30% 30%, #8b8799, #3a3745)',
              boxShadow: m.lit
                ? `0 0 8px #cfc8ff, 0 0 16px ${color}88`
                : 'inset -2px -2px 4px #00000066',
              opacity: m.lit ? 1 : 0.55,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}