import React, { useMemo, useState } from "react"
import styled from "styled-components"

/**
 * Example interactive "gizmo": a logistic growth model authors can embed in the
 * middle of a wiki page. Subteams configure the defaults via Payload; readers
 * drag the sliders and the curve + readout update live.
 *
 * Pure React state + inline SVG — no external libraries and no browser-only
 * APIs, so it is safe for Gatsby's static (SSR) build.
 *
 * N(t) = K / (1 + ((K - N0) / N0) * e^(-r * t))
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const PLOT_W = 520
const PLOT_H = 260
const PAD = 32

function finiteNumber(value, fallback, min, max) {
  return typeof value === "number" && Number.isFinite(value)
    ? clamp(value, min, max)
    : fallback
}

export const GrowthCurveSimulator = ({
  initialPopulation = 5,
  carryingCapacity = 100,
  growthRate = 0.4,
  timeMax = 24,
  inputLabel = "Hours",
}) => {
  const initialK = finiteNumber(carryingCapacity, 100, 10, 500)
  const initialN0 = finiteNumber(initialPopulation, 5, 0.001, initialK)
  const initialR = finiteNumber(growthRate, 0.4, 0.05, 1.5)
  const safeTimeMax = finiteNumber(timeMax, 24, 1, 168)
  const safeInputLabel =
    typeof inputLabel === "string" && inputLabel.length <= 40 ? inputLabel : "Hours"

  const [n0, setN0] = useState(initialN0)
  const [k, setK] = useState(initialK)
  const [r, setR] = useState(initialR)

  const { points, peak } = useMemo(() => {
    const steps = 60
    const safeN0 = clamp(n0, 0.001, k)
    const series = []
    let maxVal = 0

    for (let i = 0; i <= steps; i += 1) {
      const t = (safeTimeMax * i) / steps
      const value = k / (1 + ((k - safeN0) / safeN0) * Math.exp(-r * t))
      series.push({ t, value })
      if (value > maxVal) maxVal = value
    }

    return { points: series, peak: maxVal || 1 }
  }, [n0, k, r, safeTimeMax])

  const polyline = points
    .map((point) => {
      const x = PAD + (point.t / safeTimeMax) * (PLOT_W - PAD * 2)
      const y = PLOT_H - PAD - (point.value / peak) * (PLOT_H - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  const finalValue = points[points.length - 1]?.value ?? 0

  return (
    <Wrap>
      <Plot viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} role="img" aria-label="Logistic growth curve">
        <line x1={PAD} y1={PLOT_H - PAD} x2={PLOT_W - PAD} y2={PLOT_H - PAD} className="axis" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={PLOT_H - PAD} className="axis" />
        <line
          x1={PAD}
          y1={PLOT_H - PAD - (k / peak) * (PLOT_H - PAD * 2)}
          x2={PLOT_W - PAD}
          y2={PLOT_H - PAD - (k / peak) * (PLOT_H - PAD * 2)}
          className="capacity"
        />
        <polyline points={polyline} className="curve" />
      </Plot>

      <Controls>
        <Field>
          <label>
            Initial population: <strong>{n0.toFixed(1)}</strong>
          </label>
          <input
            type="range"
            min="1"
            max={k}
            step="1"
            value={n0}
            onChange={(event) => setN0(Number(event.target.value))}
          />
        </Field>

        <Field>
          <label>
            Carrying capacity (K): <strong>{k.toFixed(0)}</strong>
          </label>
          <input
            type="range"
            min="10"
            max="500"
            step="5"
            value={k}
            onChange={(event) => setK(Number(event.target.value))}
          />
        </Field>

        <Field>
          <label>
            Growth rate (r): <strong>{r.toFixed(2)}</strong>
          </label>
          <input
            type="range"
            min="0.05"
            max="1.5"
            step="0.05"
            value={r}
            onChange={(event) => setR(Number(event.target.value))}
          />
        </Field>

        <Readout>
          After {safeTimeMax} {safeInputLabel.toLowerCase()}:{" "}
          <strong>{finalValue.toFixed(1)}</strong> cells
        </Readout>
      </Controls>
    </Wrap>
  )
}

const Wrap = styled.div`
  display: grid;
  gap: var(--space-md);
  max-width: 54rem;
  margin: var(--space-lg) 0;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.28);

  @media (min-width: 640px) {
    grid-template-columns: 1.4fr 1fr;
    align-items: center;
  }
`

const Plot = styled.svg`
  width: 100%;
  height: auto;

  .axis {
    stroke: var(--color-border);
    stroke-width: 1.5;
  }

  .capacity {
    stroke: var(--color-accent);
    stroke-width: 1;
    stroke-dasharray: 4 4;
    opacity: 0.7;
  }

  .curve {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 2.5;
  }
`

const Controls = styled.div`
  display: grid;
  gap: var(--space-sm);
`

const Field = styled.div`
  display: grid;
  gap: 0.25rem;

  label {
    color: var(--color-text);
    font-size: 0.85rem;
  }

  input[type="range"] {
    width: 100%;
    accent-color: var(--color-accent);
  }
`

const Readout = styled.p`
  margin-top: var(--space-xs);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 0.9rem;

  strong {
    color: var(--color-text);
  }
`
