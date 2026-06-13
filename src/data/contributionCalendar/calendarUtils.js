/** @typedef {import('../subteamTracks.js').SubteamId} SubteamId */

export const CONTRIBUTION_MONTHS = [
  { key: "2026-04", label: "April", year: 2026, monthIndex: 3 },
  { key: "2026-05", label: "May", year: 2026, monthIndex: 4 },
  { key: "2026-06", label: "June", year: 2026, monthIndex: 5 },
  { key: "2026-07", label: "July", year: 2026, monthIndex: 6 },
  { key: "2026-08", label: "August", year: 2026, monthIndex: 7 },
  { key: "2026-09", label: "September", year: 2026, monthIndex: 8 },
  { key: "2026-10", label: "October", year: 2026, monthIndex: 9 },
]

const RANGE_START = "2026-04-01"
const RANGE_END = "2026-10-31"

export function parseYMD(ymd) {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function formatYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function monthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`
}

function monthKeysForRange(startDate, endDate) {
  const keys = new Set()
  const cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const last = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
  while (cur <= last) {
    keys.add(monthKey(cur.getFullYear(), cur.getMonth()))
    cur.setMonth(cur.getMonth() + 1)
  }
  return [...keys]
}

/** Sunday of the calendar week containing `date`. */
export function sundayOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - d.getDay())
  return d
}

/** Sunday–Saturday weeks intersecting Apr 1 – Oct 31 2026. Week id = `week-` + Sunday YMD. */
export function buildWeekSkeleton() {
  const rangeStart = parseYMD(RANGE_START)
  const rangeEnd = parseYMD(RANGE_END)
  const weeks = []

  const d = sundayOfWeek(rangeStart)

  for (;;) {
    const weekStart = new Date(d)
    const weekEnd = new Date(d)
    weekEnd.setDate(weekEnd.getDate() + 6)

    if (weekStart > rangeEnd) break

    if (weekEnd >= rangeStart && weekStart <= rangeEnd) {
      weeks.push({
        id: `week-${formatYMD(weekStart)}`,
        start: formatYMD(weekStart),
        end: formatYMD(weekEnd),
        monthKeys: monthKeysForRange(
          weekStart < rangeStart ? rangeStart : weekStart,
          weekEnd > rangeEnd ? rangeEnd : weekEnd
        ),
      })
    }

    d.setDate(d.getDate() + 7)
  }

  return weeks
}

/**
 * @typedef {{ ymd: string, inMonth: boolean }} MonthGridCell
 */

/** Sun–Sat rows for a month, including leading/trailing days from adjacent months. */
export function getMonthGrid(year, monthIndex) {
  const firstOfMonth = new Date(year, monthIndex, 1)
  const lastOfMonth = new Date(year, monthIndex + 1, 0)

  const gridStart = sundayOfWeek(firstOfMonth)
  const gridEnd = new Date(lastOfMonth)
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()))

  /** @type {MonthGridCell[]} */
  const cells = []
  const cur = new Date(gridStart)
  while (cur <= gridEnd) {
    cells.push({
      ymd: formatYMD(cur),
      inMonth: cur.getMonth() === monthIndex,
    })
    cur.setDate(cur.getDate() + 1)
  }

  const rows = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }
  return rows
}

export function weekIdForDate(ymd) {
  const sun = sundayOfWeek(parseYMD(ymd))
  return `week-${formatYMD(sun)}`
}

export function formatWeekRange(start, end) {
  const s = parseYMD(start)
  const e = parseYMD(end)
  const opts = { month: "short", day: "numeric" }
  const a = s.toLocaleDateString("en-US", opts)
  const b = e.toLocaleDateString("en-US", opts)
  return `${a} – ${b}`
}

export function formatDayShort(ymd) {
  return parseYMD(ymd).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
