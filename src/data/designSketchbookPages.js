/**
 * Design outreach sketchbook spreads.
 *
 * Optional per page:
 * - imageSrc / imageAlt / caption — single hero image
 * - imagePlaceholder — label shown when imageSrc is missing
 */

export const DESIGN_SKETCHBOOK_PAGES = [
  {
    id: "cover",
    title: "Design Team Sketchbook",
    subtitle: "iGEM Toronto 2026",
    body: "Web · Animations · Instagram · Character Design · Logo",
    density: "hard",
    variant: "cover",
  },
  {
    id: "web-design",
    title: "Web Design",
    body:
      "Homepage split into six sketched sections (Kathleen, Noorine, Cindy, Sara H) with Kathleen on final render/colour so the scroll story stays cohesive. DM Sans for UI type. Bottle lifecycle art (Noorine); keep the PETadex bottle from degrading too far before the battle beat. Section sketches targeted Jun 27; stitching and placeholder animations (conditions card, waterfall sink/rematch) followed in late June / July.",
    density: "soft",
    variant: "spread",
    imagePlaceholder: "Awaiting upload: homepage section lineart / rendered composite",
  },
  {
    id: "animations",
    title: "Animations",
    body:
      "Promo animation pipeline: style references shared after the first animation meeting; one person storyboards, others finish in post (CapCut + DaVinci). Logo animation (Cindy). Promo animations targeting Aug 3 alongside live-action filming (~25/35 shots by mid-July). Homepage motion: conditions pop-in, bottle sink behind water, shore rematch drift.",
    density: "soft",
    variant: "spread",
    imagePlaceholder: "Awaiting upload: animation style board or logo animation still",
  },
  {
    id: "instagram",
    title: "Instagram & social",
    body:
      "Project Intro post shipped mid-May. Road to Jamboree weekly cadence (ideate Sunday → film mid-week → edit → post) with hardware reels filmed first; series paused until the promo video lands. Newsletter mirrors RTJ in a more formal monthly voice (Brevo; Mailchimp considered later). Interest / motivation / conference posts scheduled around speaker outreach.",
    density: "soft",
    variant: "spread",
    imagePlaceholder: "Awaiting upload: Project Intro post screenshot or RTJ reel still",
  },
  {
    id: "character-design",
    title: "Character Design",
    body:
      "Brief: break stereotypes (e.g. hardware not defaulting to a male lead). Two paths — PETase-linked mascots vs subteam-specific trainers — with each trainer owning a PETamon partner. Assignments sketched across dry lab, hardware, venture, HP, outreach/web, and wet lab. Rough sketches targeted Apr 5; Google Form collected subteam feature wishes.",
    density: "soft",
    variant: "spread",
    imagePlaceholder: "Awaiting upload: trainer + PETamon character sheets",
  },
  {
    id: "logo-branding",
    title: "Logo & branding",
    body:
      "Season opened with earthy, personal branding (no AI art). Logo competition ran through spring (Chinmay early leader); Cindy led redesign and animation polish, including capitalization fixes. Grass / line-art feedback explored to stay closer to classic iGEM mark energy while keeping our own voice.",
    density: "soft",
    variant: "spread",
    imagePlaceholder: "Awaiting upload: final logo still (+ animated frame if available)",
  },
  {
    id: "back",
    title: "More pages soon",
    subtitle: "Flip back for other outreach tabs",
    body:
      "Drop CDN image URLs into designSketchbookPages.js as lineart, mockups, and character sheets are uploaded. Until then, spreads hold process notes from outreach and web-design meetings.",
    density: "hard",
    variant: "back",
  },
]

/** StPageFlip / page-flip — https://github.com/Nodlik/StPageFlip (MIT, Copyright 2020 Nodlik) */
export const PAGE_FLIP_ATTRIBUTION = {
  name: "StPageFlip",
  author: "Nodlik (Oleg Litovski)",
  url: "https://github.com/Nodlik/StPageFlip",
  license: "MIT",
  npmPackage: "page-flip",
}
