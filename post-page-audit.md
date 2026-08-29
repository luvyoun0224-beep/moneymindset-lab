# Post page style audit

## Evidence

- Current production screenshot before correction: `design/01-post-legacy.png`
- Post-fix desktop screenshot: `design/02-post-fixed.png`
- Post-fix mobile screenshot: `design/03-post-mobile-fixed.png`
- Post-fix archive screenshot: `design/04-archive-fixed.png`
- Flow: homepage → RSS-generated article detail

## Findings

- [P1] The article header still used the legacy avatar, gray-green nav, and old information architecture. It looked like a different product after leaving the new homepage.
- [P1] Grid-paper background, black display title, green/gold tokens, and white nested content panel conflicted with the homepage's navy/blue/mint editorial system.
- [P2] The advertisement placeholder appeared before meaningful article content and dominated the first viewport.
- [P2] Article metadata lacked the FACT / SCENARIO / JUDGMENT framework shown on the homepage.
- [P2] Generated-post navigation still used legacy labels rather than the homepage anchors.

## Fix scope

- Preserve RSS generation, article content, verified AdSense client, original-source link, legal links, and CTA behavior.
- Replace the generated page shell and article CSS so every future daily RSS sync inherits the same style automatically.

## Post-fix verification

- Generated-post header now uses the same brand, navigation order, navy/blue/mint tokens, thin rules, and type hierarchy as the homepage.
- Article hero adds the homepage framework rail and removes the legacy grid-paper and nested white-card treatment.
- Advertisement placeholder now appears after the core summary and callout, outside the first viewport.
- Content, source link, verified AdSense client, legal links, RSS generation, and CTA behavior remain intact.
- Mobile layout is one column with no horizontal overflow; menu open/close passed.
- Archive header, hero, footer, and active filter now share the same design system.
- Local generated-post and archive console errors: 0.
- `npm run check` equivalent: passed with 50 posts.

final result: passed
