import React from "react"
import styled from "styled-components"
import WikiLayout from "../components/layout.js"
import ScrollProgress from "../../components/scrollProgress.js"
import TableOfContents from "../../components/tableOfContents.js"
import { Layout, TOCWrapper, Content, Title, Subheading } from "../../components/pageStyles.js"

const DescriptionPage = () => (
  <WikiLayout pageTitle="Description">
    <ScrollProgress />

    <TOCWrapper>
      <TableOfContents />
    </TOCWrapper>

    <Layout>
      <Content id="page-content">
        <Title>Description</Title>
        <Subheading>Heading 1</Subheading>
        <p>The iGEM Toronto PETase project aims to accelerate the discovery and
        characterization of plastic-degrading enzymes at a global scale. By
        mining the Logan metagenomic assembly — one of the largest collections
        of environmental sequencing data — the project has identified over 216
        million putative PETase sequences from diverse microbial communities
        worldwide. These sequences are organized and made accessible through{" "}
        <strong>PETadex</strong>, a structured database and web platform that
        enables researchers to explore enzyme diversity, phylogenetic
        relationships, and predicted functional properties. The project's broader
        goal is to bridge computational enzyme discovery with experimental
        validation, ultimately supporting the development of scalable biological
        solutions for PET plastic degradation and biorecycling.</p>
        
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

export default DescriptionPage
export const Head = () => <title>Description — iGEM Toronto 2026</title>
