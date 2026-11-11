# Zoid Life

Independent, browser-based life simulator for the NOVA STEAM VERDE collection.

### Play now
- Blue/white game UI: three baby characters directly on entry, or a fully custom baby.
- Original procedural pixel characters that evolve through life while maintaining consistent traits.
- Story journal, contextual scene illustrations, central + Age button, and 4 game tabs.
- Named family, friends, partners, children, schooling, work, property, debts and health.
- 43 original age-aware bilingual event templates with persistent world consequences and replay cooldown.
- No registration. Browser-local autosave (with compatibility migration).

### Local build

Node.js 22+ recommended:

    npm install
    npm test
    npm run build
    npx playwright install chromium
    npm run test:e2e

### Source
- src/main.ts: game presentation, interactive choices, autosave
- src/life-art.ts: original age-specific modular pixel avatars
- src/characters.ts: character identity and customization
- src/social.ts: persistent relatives, partners and children
- src/simulation.ts: life states, financial and career progress
- src/event-engine.ts: weighted events, cooldown and history
- src/events-plus.ts, src/events-extended.ts: original localized story library
- src/event-scenes.ts: original contextual visual scenes
- tests/: unit, stress and Chromium browser acceptance
- docs/RELEASE_CHECKLIST.md: release gates and Cloudflare branch strategy
- docs/REA_ANALYSIS.md: evidence-based limitations of offline package inspection

### Release
Main is the reviewed source. Feature branches deploy to previews first. Cloudflare currently uses feat/initial-web-foundation as its production release branch. Until that build configuration is deliberately changed, promote a tested main Git tree to the existing production branch **once per approved release**, without force updates. Confirm deployed commit in Cloudflare.

Preview and production are independent. A green GitHub Actions check does not itself prove the public site was updated.

This is an independent original simulation; no third-party source code, screenshots, text or graphical assets are shipped.
