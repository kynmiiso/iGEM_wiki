import React from "react"
import WikiLayout from "../components/layout.js"
import HomePage from "../components/HomePage.js"

const IndexPage = () => (
  <WikiLayout>
    <HomePage />
  </WikiLayout>
)

export default IndexPage
export const Head = () => <title>Home — iGEM Toronto 2026</title>
