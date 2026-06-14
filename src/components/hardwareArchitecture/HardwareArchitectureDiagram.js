import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import styled from "styled-components"
import {
  HARDWARE_ARCH_EDGES,
  HARDWARE_ARCH_GROUPS,
  HARDWARE_LEGEND_ORDER,
  HARDWARE_SUBSYSTEMS,
} from "../../data/hardwareArchitecture.js"

const GROUP_BY_ID = Object.fromEntries(HARDWARE_ARCH_GROUPS.map((g) => [g.id, g]))

function getSubsystemColor(subsystemId) {
  return HARDWARE_SUBSYSTEMS[subsystemId]?.color ?? "#888880"
}

function rectCenter(r) {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 }
}

/** Point on the border of rect r in the direction of (towardX, towardY). */
function borderPoint(r, towardX, towardY) {
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2
  const dx = towardX - cx
  const dy = towardY - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy }
  const hw = r.w / 2
  const hh = r.h / 2
  const tx = dx !== 0 ? hw / Math.abs(dx) : Infinity
  const ty = dy !== 0 ? hh / Math.abs(dy) : Infinity
  const t = Math.min(tx, ty)
  return { x: cx + dx * t, y: cy + dy * t }
}

/**
 * Build the curved path + label point between two measured rects.
 * `offset` shifts the whole curve perpendicular to its direction, so multiple
 * edges between the same two boxes render as distinct parallel arrows instead
 * of stacking on top of one another.
 */
function edgeGeometry(fromRect, toRect, selfLoop, offset = 0) {
  if (!fromRect || !toRect) return null

  if (selfLoop) {
    const x = fromRect.x + fromRect.w
    const y = fromRect.y + fromRect.h / 2
    const d = `M ${x} ${y - 12} C ${x + 48} ${y - 36}, ${x + 48} ${y + 36}, ${x} ${y + 12}`
    return { d, labelX: x + 40, labelY: y }
  }

  const cFrom = rectCenter(fromRect)
  const cTo = rectCenter(toRect)
  const b1 = borderPoint(fromRect, cTo.x, cTo.y)
  const b2 = borderPoint(toRect, cFrom.x, cFrom.y)

  // Shift the endpoints perpendicular to the edge direction by `offset`.
  const len = Math.hypot(b2.x - b1.x, b2.y - b1.y) || 1
  const perpX = (-(b2.y - b1.y) / len) * offset
  const perpY = ((b2.x - b1.x) / len) * offset
  const p1 = { x: b1.x + perpX, y: b1.y + perpY }
  const p2 = { x: b2.x + perpX, y: b2.y + perpY }

  const dx = p2.x - p1.x
  const dy = p2.y - p1.y

  let cp1
  let cp2
  if (Math.abs(dy) >= Math.abs(dx)) {
    const midY = p1.y + dy * 0.5
    cp1 = { x: p1.x, y: midY }
    cp2 = { x: p2.x, y: midY }
  } else {
    const midX = p1.x + dx * 0.5
    cp1 = { x: midX, y: p1.y }
    cp2 = { x: midX, y: p2.y }
  }

  const d = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`
  return {
    d,
    labelX: (p1.x + p2.x) / 2,
    labelY: (p1.y + p2.y) / 2,
  }
}

const LABEL_FONT = 9
const LABEL_CHAR_W = 4.7
const LABEL_LINE_H = 12
const LABEL_MAX_CHARS = 22
const LABEL_PAD_X = 8
const LABEL_PAD_Y = 6

function wrapLabel(text, maxChars) {
  const words = String(text).split(/\s+/)
  const lines = []
  let current = ""
  for (const word of words) {
    if (!current) {
      current = word
    } else if ((current + " " + word).length <= maxChars) {
      current += " " + word
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

function rectsOverlap(a, b, margin = 0) {
  return (
    a.x < b.x + b.w + margin &&
    a.x + a.w + margin > b.x &&
    a.y < b.y + b.h + margin &&
    a.y + a.h + margin > b.y
  )
}

/**
 * Place edge labels so they don't overlap each other. Each label starts at its
 * edge midpoint and is nudged the minimum distance needed to separate it from
 * its neighbours (along whichever axis needs the least movement), so labels
 * stay close to their arrows. Labels are drawn above the boxes, so they never
 * get hidden when groups collapse.
 */
function layoutLabels(labelSeeds, canvasSize) {
  const labels = labelSeeds.map((seed, index) => {
    const lines = wrapLabel(seed.text, LABEL_MAX_CHARS)
    const w = Math.max(...lines.map((l) => l.length)) * LABEL_CHAR_W + LABEL_PAD_X * 2
    const h = lines.length * LABEL_LINE_H + LABEL_PAD_Y * 2
    // Stagger the initial position so labels that share an anchor don't start
    // stacked exactly on top of each other (helps the resolver converge).
    const jitter = (index % 2 === 0 ? 1 : -1) * index * 2
    return {
      id: seed.id,
      color: seed.color,
      lines,
      w,
      h,
      ax: seed.x,
      ay: seed.y,
      x: seed.x - w / 2 + jitter,
      y: seed.y - h / 2 - jitter,
    }
  })

  const W = canvasSize.w || 1000
  const H = canvasSize.h || 620
  const margin = 4

  for (let iter = 0; iter < 220; iter += 1) {
    let moved = false

    for (let i = 0; i < labels.length; i += 1) {
      for (let j = i + 1; j < labels.length; j += 1) {
        const a = labels[i]
        const b = labels[j]
        if (!rectsOverlap(a, b, margin)) continue

        const overlapX =
          Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + margin
        const overlapY =
          Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + margin

        // Separate along the axis of least overlap (minimum translation),
        // keeping each label as close to its arrow as possible.
        if (overlapX <= overlapY) {
          const shift = overlapX / 2 + 0.5
          if (a.x + a.w / 2 <= b.x + b.w / 2) {
            a.x -= shift
            b.x += shift
          } else {
            a.x += shift
            b.x -= shift
          }
        } else {
          const shift = overlapY / 2 + 0.5
          if (a.y + a.h / 2 <= b.y + b.h / 2) {
            a.y -= shift
            b.y += shift
          } else {
            a.y += shift
            b.y -= shift
          }
        }
        moved = true
      }
    }

    for (const a of labels) {
      if (a.x < 2) a.x = 2
      if (a.x + a.w > W - 2) a.x = W - a.w - 2
      if (a.y < 2) a.y = 2
      if (a.y + a.h > H - 2) a.y = H - a.h - 2
    }

    if (!moved) break
  }

  return labels
}

function isHighlighted(subsystemId, activeSubsystems) {
  if (!activeSubsystems || activeSubsystems.size === 0) return true
  return activeSubsystems.has(subsystemId)
}

function hasActiveFilter(activeSubsystems) {
  return activeSubsystems && activeSubsystems.size > 0
}

function GroupCard({
  group,
  collapsed,
  onToggle,
  activeSubsystems,
  registerRef,
}) {
  const color = getSubsystemColor(group.subsystem)
  const highlighted = isHighlighted(group.subsystem, activeSubsystems)
  const dimmed = hasActiveFilter(activeSubsystems) && !highlighted
  const isLeaf = group.children.length === 0

  if (isLeaf) {
    return (
      <GroupRoot
        ref={(el) => registerRef(group.id, el)}
        $area={group.gridArea}
        $dimmed={dimmed}
        data-group-id={group.id}
      >
        <SingleNode $color={color} $dimmed={dimmed} $emphasized={group.id === "bioreactor"}>
          {group.label}
        </SingleNode>
        {group.note && <GroupNote>{group.note}</GroupNote>}
      </GroupRoot>
    )
  }

  return (
    <GroupRoot
      ref={(el) => registerRef(group.id, el)}
      $area={group.gridArea}
      $dimmed={dimmed}
      data-group-id={group.id}
    >
      <GroupHeader
        type="button"
        $color={color}
        $highlighted={highlighted}
        $dimmed={dimmed}
        $emphasized={group.id === "bioreactor"}
        aria-expanded={!collapsed}
        aria-controls={`group-${group.id}-children`}
        onClick={onToggle}
        $clickable
      >
        <Chevron aria-hidden $collapsed={collapsed}>
          ▾
        </Chevron>
        <GroupTitle $display={group.id === "bioreactor"}>{group.label}</GroupTitle>
      </GroupHeader>
      <ChildList id={`group-${group.id}-children`} $collapsed={collapsed}>
        {group.children.map((child) => {
            const childHi = isHighlighted(child.subsystem ?? group.subsystem, activeSubsystems)
            const childDim = hasActiveFilter(activeSubsystems) && !childHi
            return (
              <ChildItem
                key={child.id}
                $color={getSubsystemColor(child.subsystem ?? group.subsystem)}
                $dimmed={childDim}
              >
                {child.label}
              </ChildItem>
            )
          })}
      </ChildList>
    </GroupRoot>
  )
}

export function HardwareArchitectureDiagram() {
  const [collapsed, setCollapsed] = useState(() => new Set())
  const [activeSubsystems, setActiveSubsystems] = useState(() => new Set())
  const [rects, setRects] = useState({})
  const [canvasSize, setCanvasSize] = useState({ w: 1000, h: 620 })

  const canvasRef = useRef(null)
  const groupRefs = useRef({})

  const registerRef = useCallback((id, el) => {
    if (el) groupRefs.current[id] = el
    else delete groupRefs.current[id]
  }, [])

  const measure = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cb = canvas.getBoundingClientRect()
    const next = {}
    for (const group of HARDWARE_ARCH_GROUPS) {
      const el = groupRefs.current[group.id]
      if (!el) continue
      const r = el.getBoundingClientRect()
      next[group.id] = {
        x: r.left - cb.left,
        y: r.top - cb.top,
        w: r.width,
        h: r.height,
      }
    }
    setRects(next)
    setCanvasSize({ w: cb.width, h: cb.height })
  }, [])

  useLayoutEffect(() => {
    measure()
  }, [measure, collapsed])

  useEffect(() => {
    measure()
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure)
      return () => window.removeEventListener("resize", measure)
    }
    const ro = new ResizeObserver(() => measure())
    if (canvasRef.current) ro.observe(canvasRef.current)
    for (const group of HARDWARE_ARCH_GROUPS) {
      const el = groupRefs.current[group.id]
      if (el) ro.observe(el)
    }
    window.addEventListener("resize", measure)
    const raf = requestAnimationFrame(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
      cancelAnimationFrame(raf)
    }
  }, [measure])

  const toggleCollapse = useCallback((groupId) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }, [])

  const toggleLegend = useCallback((subsystemId) => {
    setActiveSubsystems((prev) => {
      const next = new Set(prev)
      if (next.has(subsystemId)) next.delete(subsystemId)
      else next.add(subsystemId)
      return next
    })
  }, [])

  const clearHighlight = useCallback(() => setActiveSubsystems(new Set()), [])

  const visibleEdges = useMemo(
    () =>
      HARDWARE_ARCH_EDGES.filter((edge) => {
        const fromGroup = GROUP_BY_ID[edge.from]
        const toGroup = GROUP_BY_ID[edge.to]
        return Boolean(fromGroup && toGroup)
      }),
    []
  )

  const edgeGeoms = useMemo(() => {
    // Group edges that share the same two endpoints so we can fan them out.
    const groups = new Map()
    visibleEdges.forEach((edge) => {
      const key = [edge.from, edge.to].sort().join("~")
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(edge.id)
    })

    return visibleEdges.map((edge) => {
      const key = [edge.from, edge.to].sort().join("~")
      const siblings = groups.get(key)
      const index = siblings.indexOf(edge.id)
      const offset =
        siblings.length > 1 ? (index - (siblings.length - 1) / 2) * 14 : 0
      return {
        edge,
        geometry: edgeGeometry(
          rects[edge.from],
          rects[edge.to],
          edge.from === edge.to,
          offset
        ),
      }
    })
  }, [visibleEdges, rects])

  const labelLayout = useMemo(() => {
    const seeds = edgeGeoms
      .filter(({ edge, geometry }) => {
        if (!geometry || !edge.label) return false
        return !hasActiveFilter(activeSubsystems) || isHighlighted(edge.subsystem, activeSubsystems)
      })
      .map(({ edge, geometry }) => ({
        id: edge.id,
        text: edge.label,
        color: getSubsystemColor(edge.subsystem),
        x: geometry.labelX,
        y: geometry.labelY,
      }))
    return layoutLabels(seeds, canvasSize)
  }, [edgeGeoms, canvasSize, activeSubsystems])

  return (
    <DiagramRoot>
      <DiagramColumn>
        <DiagramHint>
          Click a subsystem header to collapse its components. Select one or more legend
          items to highlight related parts — click again to deselect.
        </DiagramHint>

        <Canvas ref={canvasRef}>
          <SvgLayer
            viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              {visibleEdges.map((edge) => {
                const color = getSubsystemColor(edge.subsystem)
                return (
                  <marker
                    key={edge.id}
                    id={`arrow-${edge.id}`}
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0,0 L8,4 L0,8 z" fill={color} />
                  </marker>
                )
              })}
            </defs>
            {edgeGeoms.map(({ edge, geometry }) => {
              if (!geometry) return null

              const highlighted = isHighlighted(edge.subsystem, activeSubsystems)
              const dimmed = hasActiveFilter(activeSubsystems) && !highlighted
              const color = getSubsystemColor(edge.subsystem)

              return (
                <path
                  key={edge.id}
                  d={geometry.d}
                  fill="none"
                  stroke={color}
                  strokeWidth={highlighted && hasActiveFilter(activeSubsystems) ? 2.5 : 1.5}
                  strokeDasharray={edge.dashed ? "6 4" : undefined}
                  markerEnd={`url(#arrow-${edge.id})`}
                  opacity={dimmed ? 0.2 : 1}
                />
              )
            })}
          </SvgLayer>

          <GroupGrid>
            {HARDWARE_ARCH_GROUPS.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                collapsed={collapsed.has(group.id)}
                onToggle={() => toggleCollapse(group.id)}
                activeSubsystems={activeSubsystems}
                registerRef={registerRef}
              />
            ))}
          </GroupGrid>

          <LabelLayer
            viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {labelLayout.map((label) => {
              const cx = label.x + label.w / 2
              const cy = label.y + label.h / 2
              const displaced =
                Math.abs(cx - label.ax) > 12 || Math.abs(cy - label.ay) > 12
              return (
                <g key={label.id}>
                  {displaced && (
                    <line
                      x1={label.ax}
                      y1={label.ay}
                      x2={cx}
                      y2={cy}
                      stroke={label.color}
                      strokeWidth="0.75"
                      strokeDasharray="2 2"
                      opacity="0.45"
                    />
                  )}
                  <rect
                    x={label.x}
                    y={label.y}
                    width={label.w}
                    height={label.h}
                    rx="3"
                    fill="#fff"
                    stroke={label.color}
                    strokeOpacity="0.45"
                    strokeWidth="0.75"
                  />
                  <text
                    x={cx}
                    y={label.y + LABEL_PAD_Y + LABEL_LINE_H - 2}
                    textAnchor="middle"
                    fontSize={LABEL_FONT}
                    fill="var(--color-muted)"
                    fontFamily="var(--font-body)"
                  >
                    {label.lines.map((line, idx) => (
                      <tspan key={idx} x={cx} dy={idx === 0 ? 0 : LABEL_LINE_H}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              )
            })}
          </LabelLayer>
        </Canvas>
      </DiagramColumn>

      <LegendColumn>
        <LegendTitle>Subsystems</LegendTitle>
        <LegendList role="group" aria-label="Highlight subsystem">
          {HARDWARE_LEGEND_ORDER.map((id) => {
            const sub = HARDWARE_SUBSYSTEMS[id]
            const pressed = activeSubsystems.has(id)
            return (
              <LegendChip
                key={id}
                type="button"
                $color={sub.color}
                $pressed={pressed}
                aria-pressed={pressed}
                onClick={() => toggleLegend(id)}
              >
                <Swatch $color={sub.color} aria-hidden />
                <LegendChipText>
                  <strong>{sub.label}</strong>
                  <span>{sub.description}</span>
                </LegendChipText>
              </LegendChip>
            )
          })}
        </LegendList>
        {activeSubsystems.size > 0 && (
          <ClearBtn type="button" onClick={clearHighlight}>
            Show all
          </ClearBtn>
        )}
      </LegendColumn>
    </DiagramRoot>
  )
}

export default HardwareArchitectureDiagram

const DiagramRoot = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(12rem, 16rem);
  gap: var(--space-lg);
  width: 100%;
  max-width: 72rem;
  margin: var(--space-lg) 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const DiagramColumn = styled.div`
  min-width: 0;
`

const DiagramHint = styled.p`
  font-size: 0.85rem;
  color: var(--color-muted);
  margin-bottom: var(--space-md);
  line-height: 1.55;
`

const Canvas = styled.div`
  position: relative;
  min-height: 30rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: #fff;
  background-image: radial-gradient(circle, rgba(34, 34, 34, 0.07) 1px, transparent 1px);
  background-size: 18px 18px;
  overflow: hidden;
`

const SvgLayer = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`

const LabelLayer = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
`

const GroupGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: min-content;
  grid-template-areas:
    ".     bioreactor bioreactor comms"
    "ph    arduino    arduino    comms"
    "media heating    od         mixing"
    ".     power      power      .";
  gap: clamp(0.5rem, 1.6vw, 1.25rem);
  padding: clamp(0.6rem, 1.8vw, 1.25rem);
  align-content: start;
  align-items: start;
  box-sizing: border-box;

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "bioreactor bioreactor"
      "comms      comms"
      "ph         arduino"
      "media      heating"
      "od         mixing"
      "power      power";
  }
`

const GroupRoot = styled.div`
  grid-area: ${({ $area }) => $area};
  align-self: start;
  width: 100%;
  min-width: 0;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.28 : 1)};
  transition: opacity 0.2s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const GroupHeader = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  text-align: left;
  appearance: none;
  border: 1px solid var(--color-border);
  border-left: 4px solid ${({ $color }) => $color};
  border-radius: 6px;
  padding: clamp(0.35rem, 1.1vw, 0.5rem) clamp(0.4rem, 1.2vw, 0.65rem);
  background: ${({ $emphasized }) =>
    $emphasized
      ? "color-mix(in srgb, var(--color-accent) 18%, #fff)"
      : "#fff"};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  box-shadow: ${({ $highlighted }) =>
    $highlighted ? "0 0 0 1px color-mix(in srgb, var(--color-accent) 40%, transparent)" : "none"};

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
  }
`

const Chevron = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  color: var(--color-muted);
  transform: rotate(${({ $collapsed }) => ($collapsed ? "-90deg" : "0")});
  transition: transform 0.15s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const GroupTitle = styled.span`
  font-family: ${({ $display }) => ($display ? "var(--font-display)" : "var(--font-body)")};
  font-size: ${({ $display }) =>
    $display ? "clamp(0.85rem, 2.1vw, 1rem)" : "clamp(0.68rem, 1.5vw, 0.82rem)"};
  font-weight: ${({ $display }) => ($display ? 400 : 700)};
  color: var(--color-text);
  line-height: 1.3;
  overflow-wrap: anywhere;
  min-width: 0;
`

const SingleNode = styled.div`
  border: 1px solid var(--color-border);
  border-left: 4px solid ${({ $color }) => $color};
  border-radius: 6px;
  padding: clamp(0.4rem, 1.2vw, 0.55rem) clamp(0.45rem, 1.3vw, 0.7rem);
  background: ${({ $emphasized }) =>
    $emphasized
      ? "color-mix(in srgb, var(--color-accent) 18%, #fff)"
      : "#fff"};
  font-family: ${({ $emphasized }) => ($emphasized ? "var(--font-display)" : "var(--font-body)")};
  font-size: ${({ $emphasized }) =>
    $emphasized ? "clamp(0.85rem, 2.1vw, 1rem)" : "clamp(0.68rem, 1.5vw, 0.82rem)"};
  font-weight: ${({ $emphasized }) => ($emphasized ? 400 : 600)};
  overflow-wrap: anywhere;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.28 : 1)};
  transition: opacity 0.2s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const GroupNote = styled.p`
  font-size: 0.72rem;
  color: var(--color-muted);
  line-height: 1.45;
  margin: 0.35rem 0 0;
  padding: 0 0.15rem;
`

const ChildList = styled.ul`
  list-style: none;
  margin: 0.35rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  overflow: hidden;
  transition: max-height 0.2s ease, opacity 0.2s ease, margin 0.2s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  ${({ $collapsed }) =>
    $collapsed
      ? `
    max-height: 0;
    opacity: 0;
    margin-top: 0;
    pointer-events: none;
  `
      : `
    max-height: 22rem;
    opacity: 1;
  `}
`

const ChildItem = styled.li`
  font-size: clamp(0.6rem, 1.35vw, 0.72rem);
  line-height: 1.35;
  padding: clamp(0.28rem, 0.9vw, 0.35rem) clamp(0.35rem, 1.1vw, 0.5rem);
  overflow-wrap: anywhere;
  border: 1px solid color-mix(in srgb, ${({ $color }) => $color} 35%, var(--color-border));
  border-left: 3px solid ${({ $color }) => $color};
  border-radius: 4px;
  background: color-mix(in srgb, ${({ $color }) => $color} 8%, #fff);
  color: var(--color-text);
  opacity: ${({ $dimmed }) => ($dimmed ? 0.28 : 1)};
  transition: opacity 0.2s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const LegendColumn = styled.aside`
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-md);
  background: #fff;
  align-self: start;
  position: sticky;
  top: 120px;

  @media (max-width: 900px) {
    position: static;
  }
`

const LegendTitle = styled.h3`
  font-family: var(--font-body) !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 0 0 var(--space-sm) !important;
  padding: 0 !important;
  border: none !important;
`

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

const LegendChip = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  appearance: none;
  border: 1px solid ${({ $pressed, $color }) => ($pressed ? $color : "var(--color-border)")};
  border-radius: 6px;
  padding: 0.45rem 0.55rem;
  background: ${({ $pressed, $color }) =>
    $pressed ? `color-mix(in srgb, ${$color} 14%, #fff)` : "#fff"};
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: ${({ $color }) => $color};
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const Swatch = styled.span`
  flex-shrink: 0;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  margin-top: 0.2rem;
`

const LegendChipText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;

  strong {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--color-text);
  }

  span {
    font-size: 0.68rem;
    line-height: 1.4;
    color: var(--color-muted);
  }
`

const ClearBtn = styled.button`
  appearance: none;
  margin-top: var(--space-sm);
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  background: var(--color-bg);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: var(--color-accent);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
`
