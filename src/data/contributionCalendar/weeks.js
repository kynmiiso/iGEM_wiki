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
        summary: "Bioreactor requirements gathering.",
        detail: "Documented temperature and pH sweep needs from wet lab; rough BOM for prototype v0.",
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
  "week-2026-05-03": {
    overview:
      "First experimental cycles: assay pilots in wet lab, metagenomic mining jobs on cluster, and CAD for bioreactor frame v1.",
    milestones: [
      { date: "2026-05-06", label: "Bioreactor CAD freeze", subteamId: "hardware" },
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
        summary: "Frame v1 laser-cut ordered.",
        detail: "Ordered acrylic test frame; firmware stub for temperature logging started.",
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
  "week-2026-05-31": {
    milestones: [
      { date: "2026-06-03", label: "Pickup orders and organize and label reagents", subteamId: "wetLab" },
      { date: "2026-06-04", label: "Prep LB broth and LB agar, autoclave, pouring plates", subteamId: "wetLab" },
    ]
  },
  "week-2026-06-07": {
    milestones: [
      { date: "2026-06-11", label: "Pickup cells and liquid culture for comp cells", subteamId: "wetLab" },
      { date: "2026-06-12", label: "BME Teaching Lab tour, prepare SOB media, prepare Mix&Go comp cells", subteamId: "wetLab" },
    ]
  },
  "week-2026-06-14": {
    overview:
      "Mid-season integration: validated hits list, bioreactor bring-up, and public engagement at local outreach event.",
    milestones: [
      { date: "2026-06-18", label: "Community workshop", subteamId: "outreach" },
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
        summary: "Bioreactor wet test.",
        detail: "Leak test passed; PID tuning for heating loop started.",
        link: "/hardware/notebook/",
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
  "week-2026-07-26": {
    overview:
      "Summer crunch: hardware v2 iteration, scaled assays, and wiki content freeze targets for August review.",
    milestones: [
      { date: "2026-07-29", label: "Bioreactor v2 assembled", subteamId: "hardware" },
    ],
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
        summary: "v2 assembly complete.",
        detail: "Swapped heating element; added pH probe mount and cable routing.",
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
export const CONTRIBUTION_WEEKS = buildWeekSkeleton().map((sk) =>
  mergeWeek(sk, WEEK_CONTENT_OVERRIDES[sk.id])
)

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
