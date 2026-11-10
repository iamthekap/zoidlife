# Zoid Life — life simulator

Original bilingual browser game in the NOVA STEAM VERDE ecosystem.

## Play
- No login or sign-up.
- Choose from 3 newly generated candidates or design your own: name, birthplace, appearance and attributes.
- Original blocky **waist-up pixel characters**, repeated across scene images, selection cards and gameplay.
- 24 authored pt-BR/en narrative event templates that respond to age and simulation state. Replayable events have a multi-year cooldown; major milestones occur at most once.
- Yearly mechanics: school and college; work and pensions; income and debt; friendships, partners, children, health, investments and owned property.
- Mobile game navigation plus a 3-column desktop layout.
- Saves persist in the current browser's localStorage, with migration of older lives.

## Development

Node 22 or newer.

    npm install
    npm test
    npm run build
    npx playwright install chromium
    npm run test:e2e

## Automated acceptance
GitHub Actions runs unit/stress tests, strict TypeScript, Vite build, and real Chromium UI tests. CI reports failures and uploads Playwright traces. A passing build confirms quality gates, **not zero bugs**; conduct visual/manual QA on the generated preview URL.

## Branches and Cloudflare
- main: production code
- feature/*: preview and tests
- Preview must be checked before PR merge.
- Production branch in Cloudflare must be configured as main; build command npm run build; deploy command npx wrangler deploy.
- If Cloudflare still has feat/initial-web-foundation as production, the main domain continues showing the old green site despite successful GitHub CI.
- Do not merge solely to force deployment.
- Do not assume Cloudflare production rollout until its deployment record matches the main commit and user sees the new release.

Production: https://zoidlife.kapyoutub.workers.dev

## Code
- src/main.ts — presentation, navigation, persistence, life choices
- src/characters.ts — procedural original waist-up character pixels
- src/event-scenes.ts — reusable original event image compositions and iconography
- src/event-engine.ts — age/context aware event selection, repetition cooldown and legacy history migration
- src/events-plus.ts — original narrative content
- src/simulation.ts — finance, family, education, career, health, aging
- tests/ — browser, unit, stress tests
- docs/REA_ANALYSIS.md — evidence-supported APK inspection and legal boundaries

No third-party game code, UI assets, texts, portraits or sounds are used.
