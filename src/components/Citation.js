import React from "react"

const Citation = ({ number }) => (
  <sup>
    <a
      href={`#ref-${number}`}
      id={`cite-${number}`}
      style={{ textDecoration: "none", color: "var(--color-text)" }}
    >
      [{number}]
    </a>
  </sup>
)

export default Citation