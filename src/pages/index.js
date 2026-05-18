import React from "react"
import WikiLayout from "../components/layout.js"
<<<<<<< Updated upstream
import HomePage from "../components/HomePage.js"

const IndexPage = () => (
  <WikiLayout>
    <HomePage />
  </WikiLayout>
)

export default IndexPage
=======
import { HomeScrollPrototype } from "../components/HomeScrollPrototype.js"

const HomePage = () => (
  <WikiLayout hideSiteChrome>
    <HomeScrollPrototype />
  </WikiLayout>
)

export default HomePage

>>>>>>> Stashed changes
export const Head = () => <title>Home — iGEM Toronto 2026</title>
