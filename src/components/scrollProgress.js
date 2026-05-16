import React, { useEffect, useState } from "react"
import styled from "styled-components"

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      setProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, height: 10,
      width: `${progress}%`,
      background: "linear-gradient(90deg, var(--color-accent))",
      zIndex: 9999, transition: "width 0.1s linear"
    }} />
  )
}

export default ScrollProgress