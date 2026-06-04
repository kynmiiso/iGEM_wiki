import React, { useCallback, useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import { SUBTEAM_IDS } from "../../data/subteamTracks.js"
import {
  CONTRIBUTION_WEEK_BY_ID,
  CONTRIBUTION_WEEKS,
  getDefaultWeekId,
  parseWeekHash,
} from "../../data/contributionCalendar/weeks.js"
import { MonthNav } from "./MonthNav.js"
import { WeekNav } from "./WeekNav.js"
import { PanelChrome, RestorePanelBar } from "./PanelChrome.js"
import { SubteamFilterBar } from "./SubteamFilterBar.js"
import { useSplitPane } from "./useSplitPane.js"
import { VintageMonthGrid } from "./VintageMonthGrid.js"
import { WeekDetailPanel } from "./WeekDetailPanel.js"

/** @typedef {null | 'detail' | 'calendar'} HiddenPanel */

function buildMilestonesByDate(weeks) {
  /** @type {Record<string, import('../../data/contributionCalendar/weeks.js').WeekMilestone[]>} */
  const map = {}
  for (const week of weeks) {
    for (const ms of week.milestones) {
      if (!map[ms.date]) map[ms.date] = []
      map[ms.date].push(ms)
    }
  }
  return map
}

function firstWeekIdForMonth(monthKey) {
  const w = CONTRIBUTION_WEEKS.find((wk) => wk.monthKeys.includes(monthKey))
  return w?.id ?? getDefaultWeekId()
}

export function ContributionTimeline() {
  const initialWeekId = useMemo(() => {
    if (typeof window !== "undefined") {
      const fromHash = parseWeekHash(window.location.hash)
      if (fromHash) return fromHash
    }
    return getDefaultWeekId()
  }, [])

  const initialMonth = useMemo(() => {
    const week = CONTRIBUTION_WEEK_BY_ID[initialWeekId]
    return week?.monthKeys[0] ?? "2026-04"
  }, [initialWeekId])

  const [monthKey, setMonthKey] = useState(initialMonth)
  const [selectedWeekId, setSelectedWeekId] = useState(initialWeekId)
  const [activeSubteams, setActiveSubteams] = useState(() => new Set(SUBTEAM_IDS))
  /** @type {[HiddenPanel, function]} */
  const [hiddenPanel, setHiddenPanel] = useState(null)

  const { splitPct, nudgeSplit, containerRef, onDividerPointerDown } = useSplitPane()

  const milestonesByDate = useMemo(
    () => buildMilestonesByDate(CONTRIBUTION_WEEKS),
    []
  )

  const selectedWeek = CONTRIBUTION_WEEK_BY_ID[selectedWeekId] ?? null
  const showDetail = hiddenPanel !== "detail"
  const showCalendar = hiddenPanel !== "calendar"
  const showDivider = showDetail && showCalendar

  const syncHash = useCallback((weekId) => {
    if (typeof window === "undefined" || !weekId) return
    const next = `#${weekId}`
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next)
    }
  }, [])

  const selectWeek = useCallback(
    (weekId) => {
      if (!CONTRIBUTION_WEEK_BY_ID[weekId]) return
      setSelectedWeekId(weekId)
      syncHash(weekId)
      const week = CONTRIBUTION_WEEK_BY_ID[weekId]
      if (week.monthKeys[0] && !week.monthKeys.includes(monthKey)) {
        setMonthKey(week.monthKeys[0])
      }
    },
    [monthKey, syncHash]
  )

  const selectMonth = useCallback(
    (key) => {
      setMonthKey(key)
      const current = CONTRIBUTION_WEEK_BY_ID[selectedWeekId]
      if (!current?.monthKeys.includes(key)) {
        const nextId = firstWeekIdForMonth(key)
        if (nextId) {
          setSelectedWeekId(nextId)
          syncHash(nextId)
        }
      }
    },
    [selectedWeekId, syncHash]
  )

  const toggleSubteam = useCallback((id) => {
    setActiveSubteams((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const hidePanel = useCallback((panel) => {
    setHiddenPanel(panel)
  }, [])

  const restorePanels = useCallback(() => {
    setHiddenPanel(null)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return undefined
    const onHash = () => {
      const id = parseWeekHash(window.location.hash)
      if (id) selectWeek(id)
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [selectWeek])

  return (
    <TimelineRoot>
      <SubteamNavRow>
        <SubteamFilterBar
          layout="navbar"
          activeIds={activeSubteams}
          onToggle={toggleSubteam}
        />
      </SubteamNavRow>

      <SplitContainer ref={containerRef} $split={showDivider ? splitPct : null}>
        {showDetail && (
          <DetailHalf
            $full={hiddenPanel === "calendar"}
            style={
              showDivider
                ? { flex: `0 0 ${splitPct}%`, maxWidth: `${splitPct}%` }
                : undefined
            }
          >
            {!showCalendar && (
              <RestorePanelBar
                label="Show calendar →"
                onRestore={() => setHiddenPanel(null)}
              />
            )}
            <PanelChrome
              title="Week details"
              hideLabel="Hide details"
              onHide={() => hidePanel("detail")}
              isHidden={false}
            />
            <WeekNavBar>
              <WeekNav selectedWeekId={selectedWeekId} onSelect={selectWeek} />
            </WeekNavBar>
            <DetailScroll>
              <WeekDetailPanel week={selectedWeek} activeIds={activeSubteams} />
            </DetailScroll>
          </DetailHalf>
        )}

        {showDivider && (
          <ResizeDivider
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panels"
            tabIndex={0}
            onPointerDown={onDividerPointerDown}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") nudgeSplit(-3)
              if (e.key === "ArrowRight") nudgeSplit(3)
            }}
          />
        )}

        {showCalendar && (
          <CalendarHalf $full={hiddenPanel === "detail"}>
            {!showDetail && (
              <RestorePanelBar
                label="← Show week details"
                onRestore={restorePanels}
              />
            )}
            <PanelChrome
              title="Calendar"
              hideLabel="Hide calendar"
              onHide={() => hidePanel("calendar")}
              isHidden={false}
            />
            <CalendarPanel>
              <MonthNav selectedKey={monthKey} onSelect={selectMonth} />
              <VintageMonthGrid
                monthKey={monthKey}
                selectedWeekId={selectedWeekId}
                onSelectWeek={selectWeek}
                milestonesByDate={milestonesByDate}
              />
            </CalendarPanel>
          </CalendarHalf>
        )}
      </SplitContainer>
    </TimelineRoot>
  )
}

const TimelineRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 75vh;
  width: 100%;

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
    }
  }
`

const SubteamNavRow = styled.div`
  width: 100%;
  margin-bottom: 0;
  border: 1px solid var(--color-border);
  border-radius: 8px 8px 0 0;
  border-bottom: none;
  background: #fff;
`

const SplitContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 72vh;
  border: 1px solid var(--color-border);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  width: 100%;

  @media (max-width: 900px) {
    flex-direction: column;
    min-height: auto;
  }
`

const DetailHalf = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: ${({ $full }) => ($full ? "1 1 100%" : "0 0 auto")};
  max-width: ${({ $full }) => ($full ? "100%" : "none")};

  @media (max-width: 900px) {
    flex: 1 1 auto;
    max-width: 100%;
  }
`

const WeekNavBar = styled.div`
  flex-shrink: 0;
  padding: var(--space-sm) var(--space-md) var(--space-md);
  background: #fff;
`

const DetailScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

const ResizeDivider = styled.div`
  flex: 0 0 8px;
  width: 8px;
  cursor: col-resize;
  background: var(--color-border);
  position: relative;
  touch-action: none;
  user-select: none;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 2.5rem;
    border-radius: 2px;
    background: #2d9194;
    opacity: 0.5;
  }

  &:hover,
  &:focus-visible {
    background: #2d9194;

    &::after {
      opacity: 1;
      background: #fff;
    }
  }

  @media (max-width: 900px) {
    display: none;
  }
`

const CalendarHalf = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  border-left: ${({ $full }) => ($full ? "none" : "1px solid var(--color-border)")};

  @media (max-width: 900px) {
    border-left: none;
    border-top: 1px solid var(--color-border);
  }
`

const CalendarPanel = styled.div`
  background: #fff;
  padding: var(--space-lg);
  min-height: 68vh;
  flex: 1;
  display: flex;
  flex-direction: column;
`


export default ContributionTimeline
