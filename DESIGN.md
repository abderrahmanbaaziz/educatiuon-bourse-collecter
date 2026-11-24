---
name: Study Worldwide
description: A high-trust academic operations ledger for scholarship discovery and verification.
colors:
  warm-paper: "#f7f4ed"
  working-surface: "#ffffff"
  muted-surface: "#f5f1e8"
  selected-surface: "#f2e9d9"
  quiet-border: "#e5ded2"
  strong-border: "#cfc4b3"
  ink: "#1d1c1a"
  secondary-ink: "#514b43"
  subtle-ink: "#6d655a"
  brand-ink: "#292620"
  antique-brass: "#ad8d48"
  deep-brass: "#7b5c28"
  brass-tint: "#f5ebd6"
  ink-hover: "#433d33"
  editorial-link: "#6b4a20"
  success: "#166648"
  success-tint: "#e8f3ee"
  warning: "#8b5c1c"
  warning-tint: "#fbf0dc"
  danger: "#a4382b"
  danger-tint: "#f9e9e6"
typography:
  display:
    fontFamily: "Segoe UI, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "26px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Segoe UI, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(24px, 2vw, 28px)"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Segoe UI, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 650
    lineHeight: 1.3
  body:
    fontFamily: "Segoe UI, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Segoe UI, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "4px"
  md: "7px"
  lg: "10px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.brand-ink}"
    textColor: "{colors.working-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 13px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
    textColor: "{colors.working-surface}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.working-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 13px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.working-surface}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 13px"
    height: "40px"
  field:
    backgroundColor: "{colors.working-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "9px 11px"
    height: "42px"
  nav-active:
    backgroundColor: "{colors.selected-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  status-badge:
    backgroundColor: "{colors.muted-surface}"
    textColor: "{colors.secondary-ink}"
    rounded: "{rounded.sm}"
    padding: "3px 7px"
    height: "24px"
  panel:
    backgroundColor: "{colors.working-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
---

# Design System: Study Worldwide

## Overview

**Creative North Star: "The Academic Operations Ledger"**

Study Worldwide treats scholarship evidence as the primary material. Warm paper, white working surfaces, near-black ink, and small antique-brass details give the workspace the authority of an established international academic organization without compromising the speed or density of professional operations software.

The interface is editorial at the brand boundary and restrained inside workflows. The supplied Study Worldwide artwork anchors the shell; records, crawl state, provenance, and explicit human review then take visual priority. Decoration never competes with operational truth, and uncertainty remains visible rather than being polished into false confidence.

**Key Characteristics:**

- Warm, high-trust academic character grounded in the supplied brand artwork.
- Dense, full-width working surfaces with compact controls and visible evidence.
- Flat white panels, fine warm-gray separators, and minimal elevation.
- Near-black actions, rare brass detail, and status colors reserved for meaning.
- Desktop-first operations with essential statuses, page counts, and actions preserved on mobile.

## Colors

The palette pairs warm paper and white surfaces with disciplined ink tones; antique brass brands the workspace in small doses while semantic green, amber, and red communicate system state.

### Primary

- **Brand Ink:** The default primary-action and identity color, used for filled buttons and the strongest operational emphasis.
- **Ink Hover:** A warmer lifted ink used only for primary-action hover states.

### Secondary

- **Antique Brass:** A rare decorative brand accent for supplied artwork, selection, and small emblematic details; it is not a button fill or small-text color.
- **Deep Brass:** The accessible brass tone for keyboard focus and restrained branded text treatment.
- **Editorial Link:** The dedicated readable link color on white and paper surfaces.

### Neutral

- **Warm Paper:** The application canvas behind the working area.
- **Working Surface:** The opaque white used for navigation, forms, tables, panels, and the brand masthead.
- **Muted Surface:** The quiet cream used for table headers, neutral badges, and subtle hover feedback.
- **Selected Surface:** The warmer cream used for active navigation and selected context.
- **Quiet Border / Strong Border:** The two-level separator system for ordinary divisions and higher-emphasis boundaries.
- **Ink / Secondary Ink / Subtle Ink:** The hierarchy for primary content, supporting copy, and metadata.

### Tertiary

- **Success / Success Tint:** Confirmed healthy, sent, completed, or verified states.
- **Warning / Warning Tint:** Failed, rejected, review-needed, or caution states when paired with a plain-language label.
- **Danger / Danger Tint:** Destructive actions and true error feedback only.

### Named Rules

**The Rare Brass Rule.** Brass identifies the brand and guides attention; it never floods working surfaces or substitutes for semantic status color.

**The Meaning Before Hue Rule.** Every status color is paired with a text label, and the label remains visible at every supported viewport.

## Typography

**Display Font:** Segoe UI (with system sans-serif fallbacks)

**Body Font:** Segoe UI (with system sans-serif fallbacks)

**Label Font:** Segoe UI (with system sans-serif fallbacks)

**Character:** One restrained sans-serif family keeps dense records, dates, counts, and controls immediately legible. Classical typography belongs to the supplied logo artwork rather than being imitated across the application UI.

### Hierarchy

- **Display** (650, 26px, 1.2): Login titles and compact metric values; figures use tabular numerals.
- **Headline** (650, 24–28px, 1.2): Page titles with tight tracking and no oversized hero treatment.
- **Title** (650, 17px, 1.3): Panel and section headings.
- **Body** (400, 15px, 1.5): Default interface copy, generally kept below 72–75 characters per line for explanatory text.
- **Label** (600, 13px, 1.2): Field labels, controls, metadata, and utility context; dense tables use 14px body text and 12px headers.

### Named Rules

**The Artwork Owns the Serif Rule.** Preserve the classical lettering inside the supplied logo; do not manufacture a display-serif substitute in the operational UI.

**The Numbers Must Scan Rule.** Totals, dates, durations, and counts use tabular numerals and remain visually compact.

## Layout

The desktop shell uses a 240px sticky sidebar beside a fluid workspace, with a 60px utility header and content that can expand to 1600px. The sidebar reserves 136px for the uncropped horizontal logo. Main content uses 32px horizontal padding on large screens, 24px at tablet widths, and 16px on mobile. Sections follow a compact 4/8/12/16/20/24/32/48px rhythm.

The overview opens with one segmented four-column metric strip rather than independent KPI cards. Beneath it, operational content uses a 1.5fr/0.7fr split that collapses to one column below 1024px. Tables retain deliberate horizontal scrolling when they are genuinely wide; the crawl summary is the exception on narrow phones, where its Source, Status, and Pages columns remain visible in a fixed three-column layout. Metric tiles remain a compact two-by-two grid at phone widths.

At 768px and below, the sidebar becomes an explicit header menu using the approved icon-only mark. Navigation remains touch-accessible, content stays full-width, and essential operational status text is not hidden. At 520px and below, forms become single-column and panel corners tighten from large to medium.

**The Data Uses the Width Rule.** Tables and records expand into available workspace width; they are never constrained to a marketing-style narrow column.

**The Mobile Evidence Rule.** Responsive reduction may reflow or scroll secondary structure, but crawl status, page counts, and primary actions remain available.

## Elevation & Depth

The system is flat by default. Warm canvas, opaque white surfaces, tonal fills, and one-pixel borders establish hierarchy without card shadows. The only shipped shadow is a restrained ambient layer on the open mobile navigation panel, where physical elevation clarifies that the menu sits above the workspace.

### Shadow Vocabulary

- **Mobile navigation lift** (`0 12px 24px rgba(41, 38, 32, 0.12)`): Used only by the expanded mobile navigation panel.

### Named Rules

**The Flat-by-Default Rule.** Resting panels and metric strips use borders and tonal contrast; shadows are reserved for a surface that truly overlays another surface.

## Shapes

Corners are compact and architectural: 4px for badges and small controls, 7px for buttons, inputs, notices, and mobile panels, and 10px for major panels and segmented metric containers. Borders are one pixel and warm gray. The segmented metric strip shares one outer silhouette and uses internal rules instead of turning every number into a separate floating card. The status dot is the only deliberately circular recurring form.

**The Shared Container Rule.** Related metrics and records share a boundary; do not wrap every item in its own rounded card.

## Components

### Buttons

- **Shape:** Compact, gently squared controls with a 7px radius and a minimum 40px height; mobile primary controls increase to 42px.
- **Primary:** Brand-ink fill, white text, 8px × 13px padding, and 650-weight 13px labels.
- **Hover / Focus:** Hover warms the fill to ink-hover over 150ms; keyboard focus uses a 2px deep-brass outline with a 2px offset.
- **Secondary:** White with a strong warm-gray border and ink text; hover shifts to the muted surface.
- **Danger:** White with a quiet red border and danger text; hover uses the danger tint without becoming a heavy red block.
- **Disabled:** Retains its hierarchy at 55% opacity with a not-allowed cursor.

### Chips

- **Style:** Status badges are 24px-high compact labels with a 4px radius, 3px × 7px padding, a visible border, and bold 11px text.
- **State:** Neutral uses the muted surface; success and warning states use their pale semantic tints with matching dark text and explicit labels.

### Cards / Containers

- **Corner Style:** Major panels use a restrained 10px radius; phone panels use 7px.
- **Background:** Opaque working-surface white over warm paper.
- **Shadow Strategy:** Flat at rest; depth comes from tonal layers and separators.
- **Border:** One-pixel quiet border, with strong borders for major divisions.
- **Internal Padding:** Usually 16–18px; related metric tiles are separated internally rather than individually boxed.

### Inputs / Fields

- **Style:** Persistent labels sit above 42px white fields with a 7px radius, strong warm-gray stroke, and 9px × 11px padding.
- **Focus:** The global deep-brass two-pixel focus outline remains visible outside the control; caret color uses deep brass.
- **Error / Disabled:** Errors use the danger tint and border with plain-language text. Disabled actions must retain an explanation in the surrounding workflow.

### Navigation

Desktop navigation is a quiet 240px white rail beneath the uncropped horizontal logo. Items are 40px high, 14px, and medium weight; hover uses the muted surface and the active route uses selected-surface cream with stronger ink. Below 768px, navigation moves into a two-column overlay menu, then a single column below 520px, while the approved icon-only mark identifies the brand.

### Data Tables

Tables are the primary record pattern: 14px body text, 12px sticky headers, 10px × 12px cells, restrained row dividers, and approximately 46px rows. The first column carries the strongest ink and human-readable identity. Rows gain only a near-white warm hover fill. Dates and trailing numerical columns use tabular numerals; wide tables scroll deliberately rather than crushing content.

### Metric Strip

The overview metrics form one bordered, clipped container with four equal cells on desktop and a compact two-by-two arrangement at tablet and phone widths. Each cell uses a 13px label, a 26px tabular value, and 12px provenance copy. The component communicates live operational state, not decorative performance theater.

### Brand Masthead

Use the supplied horizontal logo at a legible 226px width inside the white desktop masthead, preserving aspect ratio and all aircraft, globe, university, and wordmark details. Use the supplied icon-only mark for the compact mobile header. Never redraw, retype, recolor, crop, or place opaque logo artwork on a conflicting dark surface.

## Do's and Don'ts

### Do:

- **Do** make evidence, provenance, review state, and crawl health more prominent than their containers.
- **Do** use the supplied Study Worldwide logo assets at their intended desktop and mobile sizes.
- **Do** keep working surfaces flat, opaque, compact, and separated by warm one-pixel rules.
- **Do** preserve status labels, crawl page counts, keyboard focus, and real actions at narrow widths.
- **Do** use tabular numerals and consistent, unambiguous date formatting for operational data.
- **Do** reserve semantic green, amber, and red for actual system meaning.

### Don't:

- **Don't** use blue or purple accents, gradients, glass effects, glows, or generic AI-sparkle styling.
- **Don't** convert repeatable records or metrics into oversized rounded card galleries.
- **Don't** use antique brass as a default button fill or as small text on white.
- **Don't** hide essential status text, page counts, or critical actions to make mobile layouts look cleaner.
- **Don't** invent data, modules, statuses, or controls to make a screen appear more complete.
- **Don't** imitate the logo's classical serif lettering with decorative type throughout the working UI.
