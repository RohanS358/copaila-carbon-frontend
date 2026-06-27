---
name: Modern Eco-Tech
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#414944'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3e6752'
  primary: '#002d1c'
  on-primary: '#ffffff'
  primary-container: '#1a4331'
  on-primary-container: '#85b098'
  inverse-primary: '#a4d0b8'
  secondary: '#506600'
  on-secondary: '#ffffff'
  secondary-container: '#c9f24a'
  on-secondary-container: '#566d00'
  tertiary: '#332300'
  on-tertiary: '#ffffff'
  tertiary-container: '#4e3800'
  on-tertiary-container: '#d39d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0edd3'
  primary-fixed-dim: '#a4d0b8'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#264e3c'
  secondary-fixed: '#c9f24a'
  secondary-fixed-dim: '#aed52e'
  on-secondary-fixed: '#161e00'
  on-secondary-fixed-variant: '#3c4d00'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
  stack-gap: 1rem
  section-gap: 4rem
---

## Brand & Style

The design system is built on a "Modern Eco-Tech" aesthetic, blending the precision of a professional carbon auditing tool with the vibrant, mission-driven energy of a school environment. It serves two distinct user groups: school administrators who require data density and professional reliability, and students who need motivational, gamified interfaces.

The style is a hybrid of **Minimalism** and **Modern Corporate**, utilizing heavy whitespace and structured layouts to ensure complex environmental data remains digestible. High-quality typography and a tactile card-based interface create an atmosphere of trust and forward-thinking innovation. The emotional goal is to move from "climate anxiety" to "climate agency"—making the invisible impact of carbon visible and actionable.

## Colors

The palette is bifurcated to serve different user mentalities. 

### Admin Palette
The core professional palette uses **Forest Green** (Primary) and **Slate Gray** (Neutral) to establish authority and focus for data-dense tables and report generation. **Mint accents** are used for success states and subtle UI highlights.

### Student Palette
The student experience introduces **Lime Green**, **Sunflower Yellow**, and **Joyful Orange**. These colors are used for badges, progress bars, and achievement cards to maintain high energy and engagement.

### Technical Coding
Greenhouse Gas (GHG) Scopes are strictly color-coded across all charts and visualizations:
- **Scope 1 (Direct):** Deep Forest Green
- **Scope 2 (Energy):** Solar Yellow
- **Scope 3 (Supply Chain):** Earth Brown

## Typography

The design system utilizes **Plus Jakarta Sans** as the primary typeface. It is chosen for its geometric clarity and friendly terminals, which maintain professionalism in admin tables while feeling approachable for students.

### Hierarchy Rules
- **Headlines:** Use Bold (700) or ExtraBold (800) weights with tighter letter-spacing for a modern, impactful look.
- **Body Text:** Use Regular (400) weight with generous line-height (1.5x) to ensure readability during long auditing sessions.
- **Data Points:** For numeric values in carbon reports, use a slightly more technical feel to distinguish data from prose.
- **Bilingual Support:** Ensure the Nepali character set scales harmoniously with the English metrics, maintaining a consistent x-height for the language toggle.

## Layout & Spacing

The layout follows a **Fluid Grid** system with a focus on "generous whitespace" to prevent data fatigue.

- **Grid:** A 12-column grid for desktop, 6-column for tablet, and 2-column for mobile.
- **Safe Areas:** Large external margins (40px on desktop) create a "framed" look, pushing content toward the center for better focus.
- **Rhythm:** An 8px linear scale is used for all internal component spacing (8, 16, 24, 32, 48, 64).
- **Responsiveness:** In the student view, layout cards stack vertically on mobile to prioritize large, tappable achievement areas. Admin tables should utilize horizontal scrolling with "sticky" first columns on smaller screens to maintain context.

## Elevation & Depth

This design system uses a combination of **Low-contrast Outlines** and **Ambient Shadows** to create a layered, "Eco-Tech" feel.

- **Borders:** Every card and primary container utilizes a thin (1px) border in `#E4EDD6`. This provides structure without the visual weight of heavy shadows.
- **Depth:** A single, consistent shadow style is used: `0 10px 25px -5px rgba(26, 67, 49, 0.05)`. This slight green tint in the shadow prevents the UI from feeling "muddy."
- **Surfaces:** Backgrounds are kept off-white or very light mint (`#F9FBF7`) to reduce eye strain and emphasize the card-based layout. Higher elevation elements (like modals) use a standard white background to pop against the subtle mint surfaces.

## Shapes

The shape language is defined by "Soft Curves." 

- **Standard Cards:** Use a `1rem` (16px) radius to feel modern and friendly.
- **Interactive Elements:** Buttons and pill-tags use a fully rounded/pill-shaped radius for high "tappability" and visual distinction from layout containers.
- **Large Sections:** Hero sections or large feature cards can scale up to a `2rem` radius to emphasize the "Modern Eco-Tech" aesthetic.
- **Charts:** Donut charts and progress bars must have rounded caps on all segments to maintain the soft visual theme.

## Components

### Buttons & Tags
- **Primary Action:** Solid Forest Green with white text, pill-shaped.
- **Student Action:** Solid Lime Green with dark text.
- **Tags/Chips:** Pill-shaped with a 0.5px border and light tinted backgrounds corresponding to their category.

### Data Visualization
- **Donut Charts:** Segments use the GHG scope colors. Center of the donut displays the aggregate metric in `data-mono` typography.
- **Progress Bars:** Backgrounds are soft mint. The "filled" segment should have a subtle pulse animation for active goals.

### Cards
- **Audit Cards:** Contain a header with an emoji icon, a bold metric, and a "trend" indicator (up/down arrow).
- **Achievement Cards:** Feature vibrant student-palette backgrounds and confetti-burst illustrations for completed climate actions.

### Inputs & Selection
- **Fields:** Subtle `#E4EDD6` borders that transition to Forest Green on focus. 
- **Toggle:** The EN ⇄ नेपाली toggle is a pill-shaped segmented control with a sliding white "pill" indicating the active state.

### Feedback & Motion
- **Count-ups:** Numbers in audit summaries should animate from zero on scroll-reveal.
- **Emojis:** Use purposeful emojis (🌿 for carbon, 🚌 for transport) as decorative but functional icons to reduce cognitive load across language barriers.