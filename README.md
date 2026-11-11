# Zoid Life

Independent, browser-based life simulator in the NOVA STEAM VERDE collection.

## Play
- Loading screen followed by **three generated babies** immediately, or a completely free custom character.
- Original modular, age-specific pixel avatars from baby through senior, preserving identity.
- Central + Age button, illustrated narrative feed, 4 navigational game tabs, clear status header.
- 43 original age-aware bilingual scenario templates, contextual criteria, event cooldown and persistent consequences.
- Named parents, partners, children and relationships, school, career, money, debt, investments, property, health.
- Portable **JSON life export and import** with basic validation, as well as automatic local browser saves.
- No login or payment, works in pt-BR and English.

## Development

Node 22+:

    npm install
    npm test
    npm run build
    npx playwright install chromium
    npm run test:e2e

## Structure
- src/main.ts — responsive UI, story orchestration, save and menu handling
- src/characters.ts — character identity and profile choices
- src/life-art.ts — pixel avatars across life stages
- src/social.ts — relatives, partners, children and bonds
- src/simulation.ts — finances, school, relationships and life progress
- src/events-plus.ts / src/events-extended.ts — authored localized event libraries
- src/event-engine.ts — repeat logic, age gating and history
- src/event-scenes.ts — original event illustrations
- src/save-io.ts — safe save import validation and filenames
- tests — unit, 500-life stress runs and Chromium smoke tests
- docs/RELEASE_CHECKLIST.md — release gates, production branch notes
- docs/REA_ANALYSIS.md — APK inspection evidence and limitations

## Cloudflare release
Main is the reviewed source of truth; feature branches receive automated previews.

The currently configured **production branch in Cloudflare** is feat/initial-web-foundation. Leave it as configured to avoid another branch change; promote the tested main tree to that branch using a non-force release commit after passing CI and verifying the preview. Confirm the production build/version ID. A successful GitHub CI does not prove active deployment.

Preview vs production URLs are different. Browser saves are stored locally, so exporting a save before clearing site data is strongly recommended.

No third-party game code, text, artwork, sprites or audio is distributed.
