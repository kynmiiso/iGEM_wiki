import React from "react"
import styled from "styled-components"

export const Layout = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
`

export const TOCWrapper = styled.div`
  position: fixed;
  top: 230px;
  width: 200px;
  left: 24px;

  @media (max-width: 1420px) {
    display: none;
  }
`

export const Content = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  min-width: 0;

  @media (max-width: 1200px) {
    padding: 0 24px;
  }
`

export const Title = styled.h1`
  margin-top: 0;
  margin-bottom: 32px;
  font-size: 3rem;
`

export const Subheading = styled.h2`
  margin-top: 16px;
  margin-bottom: 16px;
  font-size: 2rem;
`
