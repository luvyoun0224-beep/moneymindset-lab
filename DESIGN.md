# Jason Jedi Investing Design System

## 1. Atmosphere & Identity

Jason Jedi Investing should feel like a personal investing journey that has learned the discipline of an stock-investing research notebook: calm, exacting, and editorial, but visibly authored by a 2005-born individual investor whose Naver blog character and archive matter. The signature is the research ledger: graphite type on restrained paper, green conviction signals, gold editorial emphasis, personal identity moments, and data modules that feel tabular rather than dashboard-like.

## 2. Color

### Palette

Current CSS already points toward a paper, graphite, green, and gold system through `--paper`, `--ink`, `--accent`, and `--gold`. Future UI work should consolidate those implicit tokens into the roles below.

| Role | Token | Light | Dark | Current source | Usage |
|------|-------|-------|------|----------------|-------|
| Surface/page | --surface-page | #F7F8F3 | #111817 | --paper | Site background, editorial canvas |
| Surface/panel | --surface-panel | #FFFFFF | #18211F | --panel | Cards, article panels, legal pages |
| Surface/soft | --surface-soft | #EDF3EF | #202B28 | --soft | Pills, quiet callouts, metadata bands |
| Surface/inverse | --surface-inverse | #111817 | #F7F8F3 | --ink | Hero, featured note, graphite bands |
| Text/primary | --text-primary | #151818 | #F4F6F1 | --ink | Headlines, body, key labels |
| Text/secondary | --text-secondary | #66706B | #AEB8B1 | --muted | Decks, captions, supporting copy |
| Text/inverse | --text-inverse | #FFFFFF | #151818 | current white use | Text on graphite surfaces |
| Border/default | --border-default | #D8DFDA | #35413D | --line | Dividers, card outlines, tables |
| Border/strong | --border-strong | #CBD6D0 | #50605A | hero border | Emphasized editorial frames |
| Accent/green | --accent-green | #1A6F62 | #42B59F | --accent | Primary links, active filters, positive action |
| Accent/green-strong | --accent-green-strong | #0F4D45 | #78D4C0 | --accent-strong | Hover, selected state, high conviction |
| Accent/gold | --accent-gold | #C98B2C | #E1B15B | --gold | Eyebrows, thesis markers, rule accents |
| Data/blue | --data-blue | #2D6F92 | #6CB6D6 | --blue | Neutral data category, research lane |
| Status/error | --status-error | #A84F48 | #E07870 | --red | Errors, destructive warnings only |
| Status/success | --status-success | #1A6F62 | #42B59F | --accent | Successful sync/check states |
| Status/warning | --status-warning | #C98B2C | #E1B15B | --gold | Advisory disclaimers and caveats |

### Rules

- Use the paper and graphite base for at least 80% of the interface; green and gold are accents, not backgrounds.
- Gold marks editorial emphasis: section eyebrows, thesis rules, and standout context. It is not a CTA color.
- Green marks interaction and conviction: active filters, primary text links, and focused controls.
- Data color is sparse. Prefer tabular structure, weight, and alignment before adding hue.
- Never introduce a new hex outside this file. Extend this table first.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | clamp(48px, 7vw, 96px) | 850 | 0.95 | 0 | Homepage thesis and major hero statements |
| H1 | clamp(34px, 5vw, 58px) | 800 | 1.08 | 0 | Page titles and generated post titles |
| H2 | clamp(30px, 4vw, 54px) | 760 | 1.08 | 0 | Major editorial sections |
| H3 | 23px | 760 | 1.24 | 0 | Article card titles |
| Body/lg | 18px | 400 | 1.7 | 0 | Page leads, Korean editorial summaries |
| Body | 16px | 400 | 1.65 | 0 | Default article and page copy |
| Body/sm | 14px | 500 | 1.5 | 0 | Metadata, navigation, helper copy |
| Caption | 12px | 800 | 1.4 | 0 | Eyebrows, ad labels, table labels |
| Data | 13px | 760 | 1.45 | 0 | Watchlist rows, market-strip labels, figures |

### Font Stack

- Primary: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", sans-serif.
- Data/mono: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", ui-monospace, monospace.
- Serif: none by default. Do not add a serif unless a later editorial template explicitly needs long-form magazine contrast.

### Rules

- Korean readability wins over display drama. Body copy stays at 16px or larger with generous line height.
- Use `font-variant-numeric: tabular-nums` for prices, percentages, dates, counts, and ranked lists.
- Keep letter spacing at 0. Use weight, size, and color for hierarchy.
- Long Korean headings should wrap cleanly before reaching four lines; reduce size with `clamp()` if needed.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a 4px base. Existing CSS already uses a 16/20/24/28/32/40/54/68 rhythm; future work should map those values to named tokens.

| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 4px | Hairline offset, compact separators |
| --space-2 | 8px | Metadata gaps, pill padding |
| --space-3 | 12px | Button gaps, eyebrow-to-title spacing |
| --space-4 | 16px | Mobile page edge, callout padding |
| --space-5 | 20px | Header vertical rhythm, nav spacing |
| --space-6 | 24px | Card padding, component inner rhythm |
| --space-7 | 28px | Desktop page edge, split heading gaps |
| --space-8 | 32px | Content-page padding, major component padding |
| --space-10 | 40px | Two-column editorial gaps |
| --space-12 | 48px | Compact section breaks |
| --space-14 | 56px | Hero content horizontal padding |
| --space-16 | 64px | Standard section rhythm |
| --space-18 | 72px | Main bottom padding |
| --space-24 | 96px | Large hero or page-level separation |

### Grid

- Max content width: 1240px.
- Page margins: 28px desktop/tablet, 16px mobile.
- Primary layout: editorial grids with 1px gutters or 14-18px card gaps depending on content density.
- Breakpoints: sm 640px, md 768px, lg 960px, xl 1240px.
- Data modules: align labels and values in rows; use tabular numerals and consistent column widths.

### Rules

- No decorative cards inside cards. Use full-width editorial sections and individual repeated cards only.
- Financial context modules should scan like a research terminal: aligned columns, short labels, visible source/caveat text.
- Mobile layouts collapse to one column before text becomes cramped; never rely on tiny font sizes to fit content.

## 5. Components

### Monetization Components

- **AdSense Slot**: A quiet placeholder inside generated article pages only. It must keep the existing `ad-slot` visual language, avoid click encouragement, and stay away from privacy, disclaimer, contact, and about pages.
- **Newsletter / Sponsor CTA**: A `monetization-band` or `reader-cta` surface that offers weekly note contact and sponsorship/collaboration contact. Copy should emphasize continued reading and partnership, not guaranteed revenue.
- **Related Notes Rail**: Generated posts may end with a compact `related-notes` nav back to the archive and research map so readers continue through the site instead of bouncing immediately.
- **Evergreen Guide Card**: A standard `article-card` used on the homepage to route readers into investing method, semiconductor cycle, space economy, and editorial policy pages. It should feel like a reading path, not a product feature grid.
- **Evergreen Guide Page**: A `content-page` variant for site-native explanatory pages. It must not contain ad slots before approval and should connect back to related notes or legal/policy pages.

### Rules

- Use only the verified AdSense publisher ID from the connected account for ad scripts and `ads.txt`; never use placeholder publisher IDs.
- Never ask readers to click ads, refresh pages, or perform any action for ad revenue.
- Monetization copy must not sound like investment advice, price targets, or guaranteed returns.
- Legal and contact pages stay clean and readable; they support approval trust rather than carrying ad inventory.

### Site Header
- **Structure**: blog character avatar, brand name/subtitle, compact nav.
- **Variants**: default only.
- **Spacing**: `--space-5` vertical padding, `--space-7` page edge, `--space-6` brand/nav gap.
- **States**: nav hover and focus use `--accent-green-strong`.
- **Accessibility**: visible focus ring, readable brand subtitle, no icon-only navigation.
- **Motion**: color transition only.

### Journey Bridge / Identity Card
- **Structure**: personal journey heading, explanatory paragraph, ordered steps, optional character card.
- **Variants**: homepage bridge, archive identity card, hero profile.
- **Spacing**: `--space-6` inner padding, `--space-10` split gap, `--space-12` section padding.
- **States**: cards may use a soft tonal hover or border shift only.
- **Accessibility**: character images require meaningful alt text only when they add author context; decorative header avatars use empty alt because brand text follows.
- **Motion**: transform/brightness micro motion only; no decorative 3D or scrolljacking.

### Button / Link Button
- **Structure**: inline-flex control with border and strong label.
- **Variants**: primary inverse, secondary graphite, ghost on dark, text link.
- **Spacing**: min-height 46px; horizontal padding from `--space-4` to `--space-5`.
- **States**: default, hover, active, focus, disabled, loading.
- **Accessibility**: visible focus outline; disabled state keeps contrast and cursor feedback.
- **Motion**: transform translateY(-1px) and color/background transition within micro timing.

### Article Card
- **Structure**: metadata row, title, summary, optional pill/source link.
- **Variants**: default, featured inverse, compact archive card.
- **Spacing**: `--space-6` default padding, `--space-8` featured padding.
- **States**: hover border shift, focus-within outline, loading placeholder, empty-state copy.
- **Accessibility**: whole card may contain one primary link, but nested links must remain keyboard reachable.
- **Motion**: subtle transform and border transition only.

### Topic / Research Lane Card
- **Structure**: gold rule marker, lane title, short research description.
- **Variants**: default grid card, compact mobile card.
- **Spacing**: `--space-6` padding, `--space-5` marker-to-title rhythm.
- **States**: hover and focus may deepen border, not add decorative color floods.
- **Accessibility**: card titles remain semantic headings in section order.
- **Motion**: optional opacity/transform reveal, disabled under reduced motion.

### Market Strip / Data Table
- **Structure**: label, value, context/caveat; rows or equal-width columns.
- **Variants**: hero strip, watchlist table, capital-flow module.
- **Spacing**: `--space-4` to `--space-5` row padding.
- **States**: hover row highlight only when interactive.
- **Accessibility**: use real table markup when presenting comparable rows; include text labels for visual status.
- **Motion**: no animated numbers unless values are static and reduced-motion safe.

### Content Page
- **Structure**: page hero, bordered white panel, sections with readable body copy.
- **Variants**: legal, about/contact, generated note.
- **Spacing**: `--space-8` panel padding on desktop, `--space-6` on mobile.
- **States**: links and form-like controls keep standard focus treatment.
- **Accessibility**: headings must be hierarchical and legal/disclaimer language must stay readable.
- **Motion**: none beyond link states.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 120ms | ease-out | Button press, link color, filter state |
| Standard | 180ms | ease-in-out | Card lift, panel emphasis, focus reveal |
| Emphasis | 320ms | cubic-bezier(0.16, 1, 0.3, 1) | Hero or section entry only |

### Rules

- Animate only `transform` and `opacity`; color and border changes may transition, but layout properties must not.
- Every interactive element has hover, active, focus-visible, and disabled states where applicable.
- Respect `prefers-reduced-motion: reduce`; non-essential transforms and reveals become static.
- Motion should clarify reading order. No scrolljacking, autoplay spectacle, bokeh, or decorative 3D backgrounds.

## 7. Depth & Surface

### Strategy

Mixed, but restrained: tonal paper shifts create most depth, hairline borders define editorial structure, and shadows appear only for intentional interactive lift or overlays.

| Level | Token | Value | Usage |
|-------|-------|-------|-------|
| Border/subtle | --border-subtle-rule | 1px solid var(--border-default) | Section dividers, quiet panels |
| Border/strong | --border-strong-rule | 1px solid var(--border-strong) | Hero frame, active table/card boundaries |
| Shadow/soft | --shadow-soft | 0 18px 42px rgba(21, 24, 24, 0.08) | Hover lift on article cards |
| Shadow/editorial | --shadow-editorial | 0 28px 80px rgba(21, 24, 24, 0.14) | Rare feature surface, legacy `--shadow` replacement |

### Rules

- Default surfaces are flat: paper, panel, soft, inverse.
- Prefer 1px borders and tonal contrast over large-radius card stacks.
- Use 0 border radius unless a future component needs a functional radius, such as form fields or small pills.
- Shadows must never carry the whole layout. If removing a shadow breaks hierarchy, strengthen spacing, type, or surface tone first.
