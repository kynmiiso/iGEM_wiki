import React from "react"
import styled from "styled-components"
import WikiLayout from "../../components/layout.js"
import ScrollProgress from "../../components/scrollProgress.js"
import TableOfContents from "../../components/tableOfContents.js"
import { Layout, TOCWrapper, Content, Title, Subheading } from "../../components/pageStyles.js"

const HardwareOverviewPage = () => (
  <WikiLayout pageTitle="Hardware Overview">
    <ScrollProgress />

    <TOCWrapper>
      <TableOfContents />
    </TOCWrapper>

    <Layout>
      <Content id="page-content">
        <Title>Hardware Overview</Title>
        <Subheading>Heading 1</Subheading>
        <p>The Hardware team builds custom bioreactors that simulate industrial
        recycling conditions, enabling high-throughput enzyme testing across a
        range of temperatures and pH levels. By engineering the physical
        infrastructure for experimental validation, the team bridges the gap
        between the Dry Lab's computational predictions and real-world
        applicability — ensuring that promising PETase candidates can be
        rigorously tested under conditions that reflect practical biorecycling
        scenarios.</p>
        <Subheading>Heading 2</Subheading>
        <p>Cat snacks. Unwrap toilet paper purr while eating ptracy, so mewl for food at 4am you call this cat food cats secretly make all the worlds muffins. Spill litter box, scratch at owner, destroy all furniture, especially couch asdflkjaertvlkjasntvkjn (sits on keyboard) have my breakfast spaghetti yarn. Miaow then turn around and show you my bum i hate cucumber pls dont throw it at me bawl under human beds for good morning sunshine but scratch at door to be let outside, get let out then scratch at door immmediately after to be let back in. Behind the couch destroy dog yet avoid the new toy and just play with the box it came in, and the door is opening! how exciting oh, it's you, meh. Mesmerizing birds scream for no reason at 4 am and i am the best but meow meow. </p>

        <Subheading>Heading 3</Subheading>
        <p>Cat snacks. Unwrap toilet paper purr while eating ptracy, so mewl for food at 4am you call this cat food cats secretly make all the worlds muffins. Spill litter box, scratch at owner, destroy all furniture, especially couch asdflkjaertvlkjasntvkjn (sits on keyboard) have my breakfast spaghetti yarn. Miaow then turn around and show you my bum i hate cucumber pls dont throw it at me bawl under human beds for good morning sunshine but scratch at door to be let outside, get let out then scratch at door immmediately after to be let back in. Behind the couch destroy dog yet avoid the new toy and just play with the box it came in, and the door is opening! how exciting oh, it's you, meh. Mesmerizing birds scream for no reason at 4 am and i am the best but meow meow. </p>

        <Subheading>Heading 4</Subheading>
        <p>Cat snacks. Unwrap toilet paper purr while eating ptracy, so mewl for food at 4am you call this cat food cats secretly make all the worlds muffins. Spill litter box, scratch at owner, destroy all furniture, especially couch asdflkjaertvlkjasntvkjn (sits on keyboard) have my breakfast spaghetti yarn. Miaow then turn around and show you my bum i hate cucumber pls dont throw it at me bawl under human beds for good morning sunshine but scratch at door to be let outside, get let out then scratch at door immmediately after to be let back in. Behind the couch destroy dog yet avoid the new toy and just play with the box it came in, and the door is opening! how exciting oh, it's you, meh. Mesmerizing birds scream for no reason at 4 am and i am the best but meow meow. </p>
      </Content>
    </Layout>
  </WikiLayout>
)

export default HardwareOverviewPage
export const Head = () => <title>Hardware Overview — iGEM Toronto 2026</title>
