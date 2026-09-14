import { useState } from 'react'

interface Point {
  date: string
  count: number
}

const WIDTH = 640
const HEIGHT = 260
const PAD = { top: 16, right: 16, bottom: 32, left: 44 }
const PLOT_W = WIDTH - PAD.left - PAD.right
const PLOT_H = HEIGHT - PAD.top - PAD.bottom
const Y_MAX = 400
const Y_TICKS = [0, 100, 200, 300, 400]

function xAt(i: number, count: number) {
  return PAD.left + (i / (count - 1)) * PLOT_W
}

function yAt(value: number) {
  return PAD.top + PLOT_H - (value / Y_MAX) * PLOT_H
}

export default function SignupTrendChart({ data }: { data: Point[] }) {
  const [activeIndex, setActiveIndex] = useState(Math.max(0, data.length - 1))

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-[13px] text-gray-400">
        표시할 가입 추이 데이터가 없습니다.
      </div>
    )
  }

  const linePath = data
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, data.length)} ${yAt(point.count)}`)
    .join(' ')

  const areaPath = `${linePath} L ${xAt(data.length - 1, data.length)} ${yAt(0)} L ${xAt(0, data.length)} ${yAt(0)} Z`

  const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const fraction = (e.clientX - rect.left) / rect.width
    const index = Math.min(data.length - 1, Math.max(0, Math.round(fraction * (data.length - 1))))
    setActiveIndex(index)
  }

  const active = data[activeIndex]
  const activeX = xAt(activeIndex, data.length)
  const activeY = yAt(active.count)
  const tooltipLeft = activeX > WIDTH - 90

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="최근 7일 사용자 가입 추이"
      >
        <defs>
          <linearGradient id="signupTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-blue-600)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-blue-600)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke="#f1f2f4"
              strokeWidth={1}
            />
            <text x={PAD.left - 10} y={yAt(tick) + 4} textAnchor="end" fontSize={11} fill="#9aa1af">
              {tick}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#signupTrendFill)" stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-blue-600)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((point, i) => (
          <text
            key={point.date}
            x={xAt(i, data.length)}
            y={HEIGHT - 8}
            textAnchor="middle"
            fontSize={11}
            fill="#9aa1af"
          >
            {point.date}
          </text>
        ))}

        <line
          x1={activeX}
          x2={activeX}
          y1={PAD.top}
          y2={PAD.top + PLOT_H}
          stroke="#d8dbe2"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <circle cx={activeX} cy={activeY} r={5} fill="#fff" stroke="var(--color-blue-600)" strokeWidth={2} />

        <rect
          x={PAD.left}
          y={PAD.top}
          width={PLOT_W}
          height={PLOT_H}
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={() => setActiveIndex(data.length - 1)}
        />
      </svg>

      <div
        className="pointer-events-none absolute flex -translate-y-full flex-col items-center rounded-lg bg-ink-900 px-3 py-1.5 text-center text-[11px] font-medium text-white shadow-lg"
        style={{
          left: `${(activeX / WIDTH) * 100}%`,
          top: `${(activeY / HEIGHT) * 100}%`,
          transform: `translate(${tooltipLeft ? '-90%' : '-50%'}, calc(-100% - 10px))`,
        }}
      >
        <span className="text-gray-300">{active.date}</span>
        <span className="font-semibold">{active.count.toLocaleString()}명</span>
      </div>
    </div>
  )
}
