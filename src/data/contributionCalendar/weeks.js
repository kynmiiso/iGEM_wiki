import { SUBTEAM_IDS } from "../subteamTracks.js"
import { buildWeekSkeleton } from "./calendarUtils.js"

/** @typedef {import('../subteamTracks.js').SubteamId} SubteamId */

/**
 * @typedef {Object} WeekMilestone
 * @property {string} date - YYYY-MM-DD
 * @property {string} label
 * @property {SubteamId} subteamId
 */

/**
 * @typedef {Object} SubteamWeekContent
 * @property {string} summary
 * @property {string} [detail]
 * @property {string} [link]
 */

/**
 * @typedef {Object} ContributionWeek
 * @property {string} id
 * @property {string} start
 * @property {string} end
 * @property {string[]} monthKeys
 * @property {string} overview
 * @property {WeekMilestone[]} milestones
 * @property {Record<SubteamId, SubteamWeekContent>} subteams
 */

function defaultSubteams() {
  /** @type {Record<SubteamId, SubteamWeekContent>} */
  const subteams = {}
  for (const id of SUBTEAM_IDS) {
    subteams[id] = {
      summary: "Progress update coming soon.",
      detail: "",
    }
  }
  return subteams
}

/** Rich mock copy keyed by week id — merge over skeleton weeks. */
const WEEK_CONTENT_OVERRIDES = {
  "week-2026-04-05": {
    overview:
      "Kickoff month: safety training, workspace setup, and parallel planning across wet lab, dry lab, and hardware. Web begins wiki scaffolding.",
    milestones: [
      { date: "2026-04-08", label: "Lab safety orientation", subteamId: "wetLab" },
      { date: "2026-04-10", label: "Wiki IA draft", subteamId: "web" },
    ],
    subteams: {
      wetLab: {
        summary: "Safety onboarding and inventory audit.",
        detail:
          "All members completed BSL-1 training; starter strains ordered and storage mapped for the season.",
      },
      dryLab: {
        summary: "PETadex data schema v0.1.",
        detail: "Defined sequence metadata fields and first-pass filtering thresholds for candidate PETases.",
      },
      hardware: {
        summary: "Pioreactor onboarding and early requirements work.",
        detail:
          "• Completed first pioreactor build sprint; documented screw, hat-PCB, and instruction pain points.\n• Patricia’s accessibility talk set user-friendly design criteria; shared requirements with wet lab on assay integration.",
        link: "/hardware/notebook/#journal-2026-03-27",
      },
      humanPractices: {
        summary: "Stakeholder map started.",
        detail: "Listed industry, academic, and community partners to interview in May.",
      },
      outreach: {
        summary: "Education toolkit outline.",
        detail: "Draft learning objectives for high-school workshop modules on plastics and enzymes.",
      },
      venture: {
        summary: "Market landscape scan.",
        detail: "Collected public reports on mechanical vs. enzymatic recycling economics.",
      },
      web: {
        summary: "Gatsby wiki skeleton merged.",
        detail: "Navigation, layout shell, and contribution timeline placeholder routes in place.",
        link: "/dry-lab/software/",
      },
    },
  },
  "week-2026-04-12": {
    subteams: {
      hardware: {
        summary: "Pioreactor CEO debrief and BOM kickoff.",
        detail:
          "• Debriefed with Pioreactor CEO — confirmed Stemma QT connectors and shifted away from Raspberry Pi toward cheaper MCUs.\n• Assigned BOM owners per component (pump, OD, pH, temp, fan, glassware) and reviewed requirement strings by section.",
        link: "/hardware/notebook/#journal-2026-04-15",
      },
    },
    milestones: [
      { date: "2026-04-15", label: "BOM kickoff + requirement strings", subteamId: "hardware" },
    ],
  },
  "week-2026-04-26": {
    subteams: {
      hardware: {
        summary: "BOM research and requirement flagging.",
        detail:
          "• Continued Digikey/Adafruit evaluation for pumps, sensors, and MCU options on the shared BOM sheet.\n• Leads synced with dry lab and wet lab on what the bioreactor needs to measure; flagged ambiguous requirement strings.",
        link: "/hardware/notebook/#journal-2026-04-29",
      },
    },
  },
  "week-2026-05-03": {
    overview:
      "First experimental cycles: assay pilots in wet lab, metagenomic mining jobs on cluster, and early BOM evaluation.",
    milestones: [
      { date: "2026-05-08", label: "First assay plate pilot", subteamId: "wetLab" },
    ],
    subteams: {
      wetLab: {
        summary: "Pilot plate reader assay.",
        detail: "Ran colorimetric controls; identified buffer interference to fix in week 2.",
        link: "/wet-lab/notebook/",
      },
      dryLab: {
        summary: "Batch mining job #1 queued.",
        detail: "Submitted 12 metagenome slices to HPC; expect hits catalogued by mid-May.",
        link: "/dry-lab/overview/",
      },
      hardware: {
        summary: "BOM evaluation before May ordering.",
        detail:
          "• Compared Stemma QT (I2C) vs PWM pump wiring and cable costs for multi-sensor setups.\n• Team assigned to review pioreactor source code ahead of prototyping sprint.",
      },
      humanPractices: {
        summary: "First expert interview.",
        detail: "Interviewed recycling facility operator; insights fed to hardware specs.",
      },
      outreach: {
        summary: "Classroom demo storyboard.",
        detail: "Storyboard approved for 20-minute module; printing handouts.",
      },
      venture: {
        summary: "Value proposition canvas.",
        detail: "Drafted problem/solution fit for enzymatic recycling vs. incumbent methods.",
      },
      web: {
        summary: "Atlas map prototype linked.",
        detail: "Embedded interactive map on dry lab overview with performance pass.",
      },
    },
  },
  "week-2026-05-10": {
    subteams: {
      hardware: {
        summary: "BOM ordering decisions and prototyping assignments.",
        detail:
          "• May 12: finalized ordering path for Stemma QT, external temp sensor, and manual pH via wet-lab probe.\n• May 16: split OD, heater, and MCU connectivity prototyping across owners; OD blackout-box and calibration work started.",
        link: "/hardware/notebook/#journal-2026-05-16",
      },
    },
    milestones: [
      { date: "2026-05-16", label: "OD/MCU prototyping assigned", subteamId: "hardware" },
    ],
  },
  "week-2026-05-17": {
    subteams: {
      hardware: {
        summary: "Pump and OD bench tests.",
        detail:
          "• Ran peristaltic pump test with red/blue water; plumbing validated visually.\n• OD readings were noisy — calibration work continues; real-time pH sensing deprioritized after wet-lab discussion.",
        link: "/hardware/notebook/#journal-2026-05-19",
      },
    },
  },
  "week-2026-05-24": {
    subteams: {
      hardware: {
        summary: "Cross-subteam requirements alignment.",
        detail:
          "• Filmed pioreactor demo; dry-lab leads confirmed temperature sweeps matter more than pH sweeps (25–70 °C target).\n• Agreed on continuous flow, OD600 feedback loop, and 3-pump layout; documented heater wattage and heat-up time estimates.",
        link: "/hardware/notebook/#journal-2026-05-26",
      },
    },
    milestones: [
      { date: "2026-05-26", label: "Bioreactor requirements aligned", subteamId: "hardware" },
    ],
  },
  "week-2026-05-31": {
    subteams: {
      hardware: {
        summary: "System architecture v1 and OD parts ordered.",
        detail:
          "• Drafted sensor → MCU → cloud hierarchy; split physical controls (temp, runtime, OD) from cloud analytics.\n• Selected combined photodiode + TIA for OD600; ordered parts and assigned per-subsystem validation experiments.",
        link: "/hardware/notebook/#journal-2026-06-02",
      },
    },
    milestones: [
      { date: "2026-06-02", label: "System architecture drafted", subteamId: "hardware" },
      { date: "2026-06-03", label: "Pickup orders and organize and label reagents", subteamId: "wetLab" },
      { date: "2026-06-04", label: "Prep LB broth and LB agar, autoclave, pouring plates", subteamId: "wetLab" },
    ],
  },
  "week-2026-06-07": {
    subteams: {
      hardware: {
        summary: "Subsystem DoE and CAD progress.",
        detail:
          "• Defined design-of-experiment variables for flow rate, temperature accuracy, autoclave path, and sourcing feasibility.\n• CAD underway for self-healing caps and OD components; power budgeting and I2C daisy-chain options documented.",
        link: "/hardware/notebook/#journal-2026-06-09",
      },
    },
    milestones: [
      { date: "2026-06-11", label: "Pickup cells and liquid culture for comp cells", subteamId: "wetLab" },
      { date: "2026-06-12", label: "BME Teaching Lab tour, prepare SOB media, prepare Mix&Go comp cells", subteamId: "wetLab" },
    ],
  },
  "week-2026-06-14": {
    overview:
      "Mid-season integration: validated hits list, bioreactor bring-up, and public engagement at local outreach event.",
    milestones: [
      { date: "2026-06-16", label: "OD CAD prototype ordered", subteamId: "hardware" },
      { date: "2026-06-20", label: "Top-50 PETase shortlist", subteamId: "dryLab" },
      { date: "2026-06-15", label: "Make 0.5mL DH5a liquid culture, Transform BL21 with pUC19", subteamId: "wetLab" },
      { date: "2026-06-16", label: "Inoculate 50mL SOB with DH5a culture, put into shaking incubator, Redo BL21 transformations with pUC19", subteamId: "wetLab" },
      { date: "2026-06-16", label: "Make DH5a competent cells, Transform DH5a with distro plasmids", subteamId: "wetLab" },
      { date: "2026-06-17", label: "Redo DH5a transformations", subteamId: "wetLab" },
      { date: "2026-06-17", label: "5mL liquid cultures of transformed BL21", subteamId: "wetLab" },
      { date: "2026-06-18", label: "Glycerol stock BL21, Miniprep BL21", subteamId: "wetLab" },
      { date: "2026-06-19", label: "Pour 5 chlor, 15 amp plates", subteamId: "wetLab" }
    ],
    subteams: {
      wetLab: {
        summary: "Expression trials for top candidates.",
        detail: "Transformed three priority constructs; induction conditions A/B testing.",
      },
      dryLab: {
        summary: "Shortlist published internally.",
        detail: "Applied stability and active-site filters; handed sequences to wet lab.",
        link: "/dry-lab/model/",
      },
      hardware: {
        summary: "OD CAD prototype and power architecture review.",
        detail:
          "• Claire completed initial OD CAD and sent first prototype for print; team moved task tracking to Jira.\n• Reviewed RRF protocol diagrams, motor driver vs transistor tradeoffs, and team power diagram (I2C limits, pull-up resistors).",
        link: "/hardware/notebook/#journal-2026-06-16",
      },
      humanPractices: {
        summary: "Policy memo draft.",
        detail: "Summarized Canadian extended producer responsibility context for judges.",
      },
      outreach: {
        summary: "Hosted high-school workshop.",
        detail: "Ran enzyme demo station; collected feedback forms (n=28).",
      },
      venture: {
        summary: "Competitor matrix update.",
        detail: "Compared three enzymatic recycling startups on TRL and partnerships.",
      },
      web: {
        summary: "Contribution calendar scaffold.",
        detail: "Shipped interactive timeline for subteam progress (this page).",
      },
    },
  },
  "week-2026-06-21": {
    subteams: {
      hardware: {
        summary: "Subsystem handout and build-session prep.",
        detail:
          "• Distributed subsystem components; reviewed pinout diagrams (OD needs voltage divider).\n• Planned extended build session: RRF finalization, KiCad pin diagram activity, and Arduino coding kickoff.",
        link: "/hardware/notebook/#journal-2026-06-23",
      },
    },
  },
  "week-2026-07-05": {
    subteams: {
      hardware: {
        summary: "GitHub repo live and build rhythm set.",
        detail:
          "• Created bioreactor GitHub repo; chose Thursday evenings as recurring in-person build nights.\n• Serial Studio wired to 8 devices; Lindsay soldered pumps, Claire advanced CAD/libraries, James testing thermocouple at 55 °C.",
        link: "/hardware/notebook/#journal-2026-07-07",
      },
    },
    milestones: [
      { date: "2026-07-07", label: "Bioreactor repo + build schedule", subteamId: "hardware" },
    ],
  },
  "week-2026-07-26": {
    overview:
      "Summer crunch: hardware v2 iteration, scaled assays, and wiki content freeze targets for August review.",
    milestones: [],
    subteams: {
      wetLab: {
        summary: "Assay throughput doubled.",
        detail: "Automated pipetting layout; QC on replicate CVs within target.",
        link: "/wet-lab/results/",
      },
      dryLab: {
        summary: "Model generalization tests.",
        detail: "Cross-validated scoring model on held-out metagenomes.",
      },
      hardware: {
        summary: "In-person builds and subsystem integration.",
        detail:
          "• Continued Thursday build evenings — wiring, subsystem code, and in-person test runs.\n• Validating heater, pump, and OD subsystems against design-of-experiment protocols.",
        link: "/hardware/notebook/#journal-2026-07-07",
      },
      humanPractices: {
        summary: "Ethics checklist signed off.",
        detail: "Reviewed environmental release and waste disposal with faculty advisor.",
      },
      outreach: {
        summary: "Toolkit beta PDF.",
        detail: "Released educator packet v0.9 for partner schools.",
      },
      venture: {
        summary: "Pitch deck skeleton.",
        detail: "Slides for Jamboree entrepreneurship track outlined.",
      },
      web: {
        summary: "Performance pass on home mockup.",
        detail: "Optimized scroll compositing and hardware notebook sandbox.",
      },
    },
  },
  "week-2026-09-06": {
    overview:
      "Pre-Jamboree polish: documentation sprint, final characterization runs, and venture storytelling.",
    milestones: [
      { date: "2026-09-10", label: "Wiki soft freeze", subteamId: "web" },
      { date: "2026-09-12", label: "Final bioreactor demo", subteamId: "hardware" },
    ],
    subteams: {
      wetLab: {
        summary: "Final validation replicates.",
        detail: "Ran triplicate on lead enzyme; preparing results figures.",
      },
      dryLab: {
        summary: "Software specs locked.",
        detail: "API docs and install guide reviewed for judges.",
        link: "/dry-lab/software-specs/",
      },
      hardware: {
        summary: "Demo script rehearsed.",
        detail: "Integrated sensing dashboard for live temperature/pH plot.",
      },
      humanPractices: {
        summary: "Integrated HP narrative.",
        detail: "Linked interviews to design decisions in wiki prose.",
      },
      outreach: {
        summary: "Toolkit v1.0 shipped.",
        detail: "Final PDF and slide deck uploaded to education page.",
      },
      venture: {
        summary: "Business model slide complete.",
        detail: "Added TAM/SAM/SOM and partnership pipeline slide.",
      },
      web: {
        summary: "Site-wide link audit.",
        detail: "Fixed nav order, meta titles, and contribution deep links.",
      },
    },
  },
  "week-2026-10-18": {
    overview:
      "Closing weeks: Jamboree prep, poster printing, and post-competition retrospective scheduling.",
    milestones: [
      { date: "2026-10-22", label: "Jamboree presentation dry run", subteamId: "venture" },
    ],
    subteams: {
      wetLab: {
        summary: "Lab wrap-down checklist.",
        detail: "Glycerol stocks catalogued; equipment cleaned and signed off.",
      },
      dryLab: {
        summary: "Data archive prepared.",
        detail: "Packaged PETadex snapshot and model weights for judges.",
      },
      hardware: {
        summary: "Travel crate packed.",
        detail: "Bioreactor secured for shipping; spare sensors labeled.",
      },
      humanPractices: {
        summary: "Reflection interviews scheduled.",
        detail: "Booked team retro sessions for November.",
      },
      outreach: {
        summary: "Posters for school partners.",
        detail: "Printed thank-you posters and feedback summary.",
      },
      venture: {
        summary: "Pitch timing rehearsed.",
        detail: "Recorded run-through; trimmed script to 8 minutes.",
      },
      web: {
        summary: "Final deploy tag.",
        detail: "Tagged release on GitLab; monitoring build pipeline.",
      },
    },
  },
}

/** Last date (inclusive) for quiet hardware placeholders instead of "coming soon". */
const HARDWARE_QUIET_UNTIL = "2026-07-07"

const HARDWARE_QUIET_PLACEHOLDER = {
  summary: "Read more on Hardware",
  detail: "Quiet week for hardware — continuing work from previous sessions.",
  link: "/hardware/notebook/",
}

/**
 * Real outreach week copy from meeting minutes (Mar–Jul 2026).
 * Applied after base overrides so mock outreach blurbs are replaced.
 */
const OUTREACH_WEEK_PATCHES = {
  "week-2026-03-29": {
    milestones: [
      { date: "2026-04-05", label: "Character / mascot sketch deadline", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Character sketches due; branding carryover from March kickoff.",
      detail:
        "March sessions set whimsical hand-drawn branding, PETase characters, and wiki inspiration. Character design brief (trainers + PETamon partners) targeted Apr 5 sketches.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-04-05": {
    milestones: [
      { date: "2026-04-05", label: "Character sketch deadline", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Character sheets and wiki design workshopping.",
      detail:
        "Sketch deadline for trainers + PETamon partners. Wiki concepts voted in late March; logo competition still open. Subteam meeting coverage for Project Intro posts underway.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-04-12": {
    outreach: {
      summary: "Instagram monitoring and subteam story gathering.",
      detail:
        "Members attending wet lab, hardware, dry lab, venture, and web meetings to gather Project Intro content. Logo submissions encouraged.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-04-19": {
    outreach: {
      summary: "Continuing branding and social prep.",
      detail:
        "Quiet documentation week — character/logo work and May 9 social filming plans continue from March assignments.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-04-26": {
    outreach: {
      summary: "Pre-May social and conference logistics.",
      detail:
        "Preparing May 9 photo/video coverage and sustainability-office catering inquiry for the microplastics conference.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-05-03": {
    milestones: [
      { date: "2026-05-09", label: "Team social + photo/video day", subteamId: "outreach" },
    ],
    outreach: {
      summary: "May 9 social filming and photo capture.",
      detail:
        "Outreach coverage at the team social for Instagram and wiki — upload photos to the shared Drive folder after the event.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-05-10": {
    milestones: [
      { date: "2026-05-12", label: "PetaScale at Web Summit", subteamId: "outreach" },
      { date: "2026-05-17", label: "Project Intro post + homepage design due", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Summer workflow: intro post, RTJ, newsletter, homepage.",
      detail:
        "Locked owners for Project Intro (due May 17), Road to Jamboree cadence, first newsletter (May 24), homepage finalize, and late-May picnic. Logo vote still open.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-05-17": {
    milestones: [
      { date: "2026-05-17", label: "Project Intro post due", subteamId: "outreach" },
      { date: "2026-05-17", label: "Homepage design handoff", subteamId: "outreach" },
      { date: "2026-05-24", label: "First newsletter target", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Ship Project Intro; start Road to Jamboree; logo finalize.",
      detail:
        "Project Intro drops Sunday morning; RTJ weekly filming/editing cadence begins. Homepage design to Abby/Dennis; logo redesign by May 24.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-05-24": {
    milestones: [
      { date: "2026-05-26", label: "First newsletter send (Brevo)", subteamId: "outreach" },
      { date: "2026-05-29", label: "Riverdale Park picnic social", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Project Intro live; newsletter + picnic; wiki mockup.",
      detail:
        "Project Intro completed. Newsletter transferred to Brevo for ~May 26 send (Web Summit, TFC, May 9 cleanup). Riverdale picnic May 29. Wiki asset mockup underway; promo video research assigned.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-05-31": {
    outreach: {
      summary: "Post-picnic wrap; promo research continues.",
      detail:
        "Picnic social hosted May 29. Team reviewing prior promo videos and refining logo capitalization / animation.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-06-07": {
    milestones: [
      { date: "2026-06-14", label: "Logo redesign target (Cindy)", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Promo crew staffed; conference + logo redesign.",
      detail:
        "Promo script/animation/editing/voiceover owners assigned after reviewing prior-year videos. Microplastics conference planning continues; hardware next for RTJ.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-06-14": {
    milestones: [
      { date: "2026-06-21", label: "Newsletter draft (conference teaser)", subteamId: "outreach" },
      { date: "2026-06-26", label: "Toronto Islands promo / social", subteamId: "outreach" },
      { date: "2026-06-27", label: "Homepage section sketches due", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Promo storyboard draft; homepage sections; HW reels.",
      detail:
        "Promo storyboard first draft out for comments. Homepage split into six sketched sections (render: Kathleen). Hardware RTJ reel filming mid-week. Newsletter conference announcement priority; Islands Jun 26.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-06-21": {
    milestones: [
      { date: "2026-06-26", label: "Toronto Islands filming / social", subteamId: "outreach" },
      { date: "2026-06-27", label: "Homepage section sketches due", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Promo script polish; July shoot plan; Islands.",
      detail:
        "One more session to cut promo wordcount and lock location/props; filming starts July. Hardware reel filming around hardware meeting. Homepage sketches due Jun 27.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-06-28": {
    milestones: [
      { date: "2026-06-28", label: "Web design section export check-in", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Homepage section exports and bottle lifecycle art.",
      detail:
        "Web design sync: section lineart exports, bottle lifecycle, animated logo, and placeholder animations for conditions / waterfall bottle. Kathleen rendering pass next.",
      link: "/beyond-the-bench/outreach/#design",
    },
  },
  "week-2026-07-05": {
    milestones: [
      { date: "2026-07-05", label: "Newsletter published", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Newsletter out; promo shot list; conference emails.",
      detail:
        "Newsletter live. Promo shot list started with filming this week. Conference outreach to Ryan Parmenter, Catherine McKenna, Christopher Aoun, Karen Wirsig. Interest/intro social posts scheduled.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-07-12": {
    milestones: [
      { date: "2026-07-12", label: "Miriam Diamond + Karen Wirsig confirmed", subteamId: "outreach" },
      { date: "2026-09-19", label: "Microplastics conference (save the date)", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Conference speakers confirmed; promo filming ramps.",
      detail:
        "Miriam Diamond (seminar) and Karen Wirsig (panel) confirmed; conference Sep 19. Promo shot list revamped; animations started. RTJ on hold until promo done.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-07-19": {
    milestones: [
      { date: "2026-08-03", label: "Promo animations target", subteamId: "outreach" },
      { date: "2026-07-30", label: "July newsletter draft / send window", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Promo ~25/35 shots; wiki stitch; merch + newsletter.",
      detail:
        "Filming mid-flight (Islands + hardware/wet-lab/VC windows). Animation workflow set (target Aug 3). Homepage sections stitching; July newsletter ~Jul 30/Aug 1; merch brainstorm.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-07-26": {
    outreach: {
      summary: "Promo edit + July newsletter; conference marketing.",
      detail:
        "Continue remaining promo shots and edits. July newsletter send window. Start mailing conference marketing contacts; panel theme/questions.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-08-02": {
    milestones: [
      { date: "2026-08-03", label: "Promo animations target", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Promo animation delivery window.",
      detail:
        "Animation team targeting Aug 3 delivery while filming/edit continue. Conference pamphlet and speaker logistics ongoing.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-09-06": {
    milestones: [
      { date: "2026-09-19", label: "Microplastics conference", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Conference week approach — speakers, pamphlet, promo.",
      detail:
        "September 19 microplastics conference with confirmed seminar/panel speakers. Final promo and presentation-video threads in parallel with wiki soft freeze.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-09-13": {
    milestones: [
      { date: "2026-09-19", label: "Microplastics conference", subteamId: "outreach" },
    ],
    outreach: {
      summary: "Microplastics conference (Sep 19).",
      detail:
        "Run conference programming with Miriam Diamond seminar and Karen Wirsig panel; capture photos/quotes for Impact.",
      link: "/beyond-the-bench/outreach/",
    },
  },
  "week-2026-10-18": {
    outreach: {
      summary: "Jamboree outreach wrap and partner thanks.",
      detail:
        "Presentation dry-run support, partner thank-yous, and archival of socials/newsletter assets after conference.",
      link: "/beyond-the-bench/outreach/",
    },
  },
}

const OUTREACH_QUIET_UNTIL = "2026-07-26"

const OUTREACH_QUIET_PLACEHOLDER = {
  summary: "Read more on Outreach",
  detail: "Quiet week for outreach — continuing work from previous sessions.",
  link: "/beyond-the-bench/outreach/",
}

function applyHardwareQuietWeek(week) {
  if (week.start > HARDWARE_QUIET_UNTIL) return week

  const hw = week.subteams.hardware
  if (hw.summary !== "Progress update coming soon.") return week

  return {
    ...week,
    subteams: {
      ...week.subteams,
      hardware: { ...HARDWARE_QUIET_PLACEHOLDER },
    },
  }
}

function applyOutreachWeekPatch(week) {
  const patch = OUTREACH_WEEK_PATCHES[week.id]
  if (!patch) {
    return applyOutreachQuietWeek(week)
  }

  const milestones = [...(week.milestones || [])]
  for (const milestone of patch.milestones || []) {
    const exists = milestones.some(
      (m) => m.date === milestone.date && m.label === milestone.label && m.subteamId === milestone.subteamId
    )
    if (!exists) milestones.push(milestone)
  }

  return {
    ...week,
    milestones,
    subteams: {
      ...week.subteams,
      outreach: { ...patch.outreach },
    },
  }
}

function applyOutreachQuietWeek(week) {
  if (week.start > OUTREACH_QUIET_UNTIL) return week
  if (week.subteams.outreach.summary !== "Progress update coming soon.") return week

  return {
    ...week,
    subteams: {
      ...week.subteams,
      outreach: { ...OUTREACH_QUIET_PLACEHOLDER },
    },
  }
}

function mergeWeek(skeleton, override = {}) {
  const subteams = { ...defaultSubteams(), ...(override.subteams || {}) }
  return {
    ...skeleton,
    overview:
      override.overview ||
      "Team progress for this week will be updated soon. Use subteam filters below when detailed entries are available.",
    milestones: override.milestones || [],
    subteams,
  }
}

/** @type {ContributionWeek[]} */
export const CONTRIBUTION_WEEKS = buildWeekSkeleton()
  .map((sk) => mergeWeek(sk, WEEK_CONTENT_OVERRIDES[sk.id]))
  .map(applyHardwareQuietWeek)
  .map(applyOutreachWeekPatch)

/** @type {Record<string, ContributionWeek>} */
export const CONTRIBUTION_WEEK_BY_ID = Object.fromEntries(
  CONTRIBUTION_WEEKS.map((w) => [w.id, w])
)

export function getDefaultWeekId() {
  return CONTRIBUTION_WEEKS[0]?.id ?? null
}

export function parseWeekHash(hash) {
  const raw = (hash || "").replace(/^#/, "")
  if (!raw.startsWith("week-")) return null
  return CONTRIBUTION_WEEK_BY_ID[raw] ? raw : null
}
