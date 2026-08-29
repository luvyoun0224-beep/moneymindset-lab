# Design QA — moneymindset-lab production integration

## Evidence

- Source visual truth: `design/source-option-1.png`
- Implementation screenshot: `design/implementation-desktop-final.png`
- Normalized comparison: `design/comparison-desktop-final.png`
- Mobile full-page evidence: `design/implementation-mobile-full-final.png`
- Desktop CSS viewport: 1440 × 1024
- Source pixels: 1487 × 1058
- Implementation pixels: 1425 × 1013
- Mobile CSS viewport: 390 × 844; captured page 375 × 7029 before evidence organization
- State: current RSS data loaded; search closed; menu closed; analysis drawer closed

## Findings

No actionable P0, P1, or P2 design findings remain.

### Fonts and typography — passed

- Korean sans display and body hierarchy, small monospaced research labels, dates, and framework metadata preserve the selected mock's tone.
- The current dynamic Broadcom title wraps into three lines on desktop and four readable lines on mobile.
- Long live RSS titles are line-clamped in dossier cards rather than shrinking below readable sizes.

### Spacing and layout rhythm — passed

- Three-column featured analysis, image frame, metadata rail, divider rhythm, weekly questions, and reserved advertisement region follow the source hierarchy.
- Dynamic content sections continue below the first viewport without nested-card density.
- Mobile collapses to a single editorial column before text becomes cramped.

### Colors and visual tokens — passed

- Warm off-white, ink navy, cobalt, mint, and cool-gray rules match the chosen Light Research Lab direction.
- Homepage v2 overrides the legacy grid/gradient background while legal, archive, and generated post pages retain their proven stylesheet.

### Image quality — passed

- `assets/broadcom-headquarters.png` is a dedicated high-resolution raster asset, not CSS art or a placeholder.
- Desktop and mobile crops preserve the building, sign, blue-gray palette, and mint offset frame.

### Copy and live data — passed

- Featured copy is populated from the newest matching Broadcom RSS article.
- Recent dossiers and research-map lanes read `data/posts.json`; daily GitHub Action updates them without homepage code edits.
- Current local sync includes the newly published Broadcom and Planet Labs articles.
- Existing AdSense publisher ID, `ads.txt`, privacy, disclaimer, editorial policy, contact page, sitemap, robots, and post archive remain intact.

### Interactions and accessibility — passed

- Mobile menu open/close passed.
- Search filtering and reset passed.
- Analysis drawer open/close passed.
- Desktop and mobile page-owned horizontal overflow: none.
- Semantic headings, navigation, dialog, form labels, alt text, focus states, and reduced-motion support are present.
- Browser console errors: 0.

## Comparison history

### Integration pass 1 — blocked

- [P2] Live RSS hero title wrapped into five lines and summary ended mid-number.
  - Fix: widened the copy grid, reduced dynamic headline size, and compacted the summary to two complete sentences.
- [P2] Legacy stylesheet added duplicate text arrows after icon-library arrows.
  - Fix: disabled the legacy `text-link::after` decoration only on homepage v2.
- [P2] Planet Labs and S-OIL were classified from incidental summary keywords.
  - Fix: added higher-priority company/industry rules before broad semiconductor matches.

### Integration pass 2 — passed

- Post-fix evidence: `design/comparison-desktop-final.png`
- The live RSS title, hero image, metadata, weekly questions, and ad boundary preserve the selected mock's hierarchy.
- Mobile evidence confirms one-column reading order and live article cards.

## Automation and deployment gates

- `npm run sync`: passed, 50 posts
- `npm run check`: passed, 50 posts
- GitHub Action `Sync Naver RSS`: preserved
- Vercel project: `moneymindset-lab`
- Custom domains preserved: `moneymindset-lab.com`, `www.moneymindset-lab.com`

## Follow-up polish

- P3: replace the demo newsletter success state with a real consent-aware email provider later.
- P3: keep the reserved ad slot inactive until AdSense serving is confirmed; preserve its dimensions to avoid CLS.

final result: passed
