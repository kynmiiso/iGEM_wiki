import React from "react"
import { Link } from "gatsby"
import styled from "styled-components"
import { SUBTEAM_TRACKS } from "../../data/subteamTracks.js"

export function WeekDetailPanel({ week, activeIds }) {
  if (!week) {
    return (
      <PanelRoot>
        <EmptyText>Select a week on the calendar to view progress.</EmptyText>
      </PanelRoot>
    )
  }

  return (
    <PanelRoot>
      <OverviewCard>
        <OverviewLabel>Team overview</OverviewLabel>
        <p>{week.overview}</p>
      </OverviewCard>

      <SubteamList>
        {SUBTEAM_TRACKS.filter((t) => activeIds.has(t.id)).map((track) => {
          const content = week.subteams[track.id]
          if (!content) return null
          const href = content.link || track.href
          return (
            <SubteamBlock key={track.id} $accent={track.color}>
              <SubteamHeader>
                <h3>{track.label}</h3>
              </SubteamHeader>
              <Summary>{content.summary}</Summary>
              {content.detail ? <Detail>{content.detail}</Detail> : null}
              <ReadMore to={href}>
                Read more on {track.label} →
              </ReadMore>
            </SubteamBlock>
          )
        })}
      </SubteamList>

      {activeIds.size === 0 && (
        <Hint>Turn on at least one subteam above to see detailed breakdowns.</Hint>
      )}
    </PanelRoot>
  )
}

const PanelRoot = styled.div`
  padding: var(--space-md);
  background: #fff;
  border: 1px solid var(--color-border);
  border: none;
  border-radius: 0;
  min-height: 100%;
`

const OverviewCard = styled.div`
  padding: var(--space-md);
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  margin-bottom: var(--space-sm);

  p {
    font-size: 0.92rem;
    line-height: 1.65;
    color: var(--color-text);
  }
`

const OverviewLabel = styled.p`
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
  color: #2d9194;
  margin-bottom: var(--space-xs);
`

const SubteamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`

const SubteamBlock = styled.article`
  padding: var(--space-md);
  border-left: 4px solid ${({ $accent }) => $accent};
  background: color-mix(in srgb, ${({ $accent }) => $accent} 12%, #fff);
  border-radius: 0 6px 6px 0;
`

const SubteamHeader = styled.h3`
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: var(--space-xs);
`

const Summary = styled.p`
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 0.35rem;
`

const Detail = styled.p`
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--color-muted);
  margin-bottom: var(--space-sm);
`

const ReadMore = styled(Link)`
  font-size: 0.8rem;
  font-weight: 600;
  color: #2d9194;
  text-decoration: none;
  border-bottom: 1px solid transparent;

  &:hover {
    border-bottom-color: #2d9194;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }
`

const EmptyText = styled.p`
  color: var(--color-muted);
  font-size: 0.95rem;
  padding: var(--space-xl) 0;
  text-align: center;
`

const Hint = styled.p`
  font-size: 0.85rem;
  color: var(--color-muted);
  margin-top: var(--space-md);
`

export default WeekDetailPanel
