import { GeneratedContent, LayoutType } from "./types";

export const APP_VERSION = "1.0.0";

export const LAYOUT_DEFAULTS: Record<LayoutType, Partial<GeneratedContent>> = {
  THOUGHT_LEADERSHIP: {
    tagline: "Review",
    headline: "Eindelijk overzicht in mijn planning.",
    subtext: "Jan de Hovenier",
    body: "Green Gardens BV",
    cta: "5 Sterren"
  },
  VENTURE_SPOTLIGHT: {
    tagline: "NIEUW",
    headline: "DIGITALE WERKBON.",
    subtext: "Nooit meer papieren kwijt.",
    body: "Alles digitaal beschikbaar op locatie.",
    cta: "SIMPUL SOFTWARE"
  },
  KNOWLEDGE_SHARE: {
    tagline: "WIST JE DAT?",
    headline: "Je met Simpul tot wel",
    subtext: "4 uur per week",
    body: "bespaart aan administratie?",
    cta: "Bereken je winst"
  },
  VISUAL_STORY: {
    tagline: "ACTIE",
    headline: "PROBEER GRATIS",
    subtext: "Start vandaag nog met groeien.",
    body: "",
    cta: "Link in bio"
  },
  GROWTH_METRICS: {
    tagline: "MEEST GEKOZEN",
    headline: "MKB",
    subtext: "€174/mnd",
    body: "Relaties & Projecten",
    cta: "Bekijk Demo"
  },
  CONVERSION: {
    tagline: "DEAL",
    headline: "MKB PAKKET",
    subtext: "€174/mnd",
    body: "Alles voor de professionele hovenier.",
    cta: "START TRIAL"
  },
  TEAM_CULTURE: {
    tagline: "TEAM",
    headline: "Jan de Vries",
    subtext: "HOVENIER",
    body: "Passie voor groen en techniek.",
    cta: "Profiel"
  },
  PHOTO_COLLAGE: {
    tagline: "PROJECT",
    headline: "TUIN RENOVATIE",
    subtext: "Voor & Na",
    body: "Drunen, NL",
    cta: "Bekijk Fotos"
  },
  PROCESS_TIMELINE: {
    tagline: "HOW TO",
    headline: "In 3 Stappen",
    subtext: "Aan de slag",
    body: "1. Account aanmaken\n2. Project starten\n3. Factureren",
    cta: "Start Nu"
  },
  COMPARISON: {
    tagline: "HET VERSCHIL",
    headline: "Administratie Tijd",
    subtext: "Zonder Simpul:\n2 uur per avond\nFacturen kwijt\nStress",
    body: "Met Simpul:\nKlaar in 5 min\nDirect verstuurd\nRust",
    cta: "Start Nu"
  }
};

export const LAYOUT_DESCRIPTIONS: Record<LayoutType, { title: string; description: string; bestFor: string }> = {
  THOUGHT_LEADERSHIP: {
    title: "Review / Quote",
    description: "Bouw vertrouwen op door ervaringen van bestaande klanten of experts te delen.",
    bestFor: "Klantreviews, testimonials, en sterke quotes."
  },
  VENTURE_SPOTLIGHT: {
    title: "Feature Highlight",
    description: "Zet een nieuwe functie of update in de schijnwerpers met een moderne, technische uitstraling.",
    bestFor: "Productlanceringen, updates, en belangrijk nieuws."
  },
  GROWTH_METRICS: {
    title: "Stats / Metrics",
    description: "Overtuig met harde cijfers en besparingen. Data spreekt voor zich.",
    bestFor: "ROI bewijs, tijdsbesparing, en groeicijfers."
  },
  KNOWLEDGE_SHARE: {
    title: "Did You Know?",
    description: "Deel interessante feitjes om je autoriteit in de markt te vergroten.",
    bestFor: "Educatieve content, tips, en branche-inzichten."
  },
  VISUAL_STORY: {
    title: "Photo Overlay",
    description: "Laat het beeld spreken. Minimale tekst over een krachtige foto.",
    bestFor: "Sfeerbeelden, werk in uitvoering, en inspiratie."
  },
  CONVERSION: {
    title: "Pricing / Sales",
    description: "Een duidelijke, conversie-gerichte kaart om leads te genereren.",
    bestFor: "Aanbiedingen, prijsplannen, en harde sales."
  },
  TEAM_CULTURE: {
    title: "Team Profile",
    description: "Geef je bedrijf een gezicht. Mensen doen zaken met mensen.",
    bestFor: "Medewerker uitgelicht, nieuwe aannames, en jubilea."
  },
  PHOTO_COLLAGE: {
    title: "Collage",
    description: "Toon meerdere aspecten van een project in één oogopslag.",
    bestFor: "Voor & Na foto's, projectdetails, en sfeerimpressies."
  },
  PROCESS_TIMELINE: {
    title: "Timeline / Stappenplan",
    description: "Leg een proces helder uit in opeenvolgende stappen.",
    bestFor: "How-to guides, onboarding stappen, en projectfases."
  },
  COMPARISON: {
    title: "Comparison / VS",
    description: "Zet twee situaties tegenover elkaar. Laat duidelijk het probleem en de oplossing zien.",
    bestFor: "Before/After, Do's & Don'ts, Zonder/Met."
  }
};