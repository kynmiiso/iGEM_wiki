import React from "react"
import { referenceId } from "./referenceIds.js"

const Citation = ({ number }) => {
  const targetId = referenceId(number)
  if (!targetId) return null

  return (
    <sup>
      <a
        href={`#${targetId}`}
        aria-label={`Reference ${number}`}
        style={{ textDecoration: "none", color: "var(--color-text)" }}
      >
        [{number}]
      </a>
    </sup>
  )
}

export default Citation
