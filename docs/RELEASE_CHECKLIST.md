# Zoid Life 0.10 — release gates (not a production acceptance certificate)

## Product and game loop
- [x] Loading, three visible newborn candidates and free custom creator
- [x] Annual decision modal with a blocking choice and multilingual content
- [x] Persistent illustrated chronological choice history and future-age filtering
- [x] Persistent named relatives, social encounters and second-generation continuation
- [x] Career application, qualifications, income, promotion, resignation
- [x] Savings, debts, property, investment purchase **and redemption**
- [x] Health conditions, legal choices, age gates and ending recap
- [x] JSON export/import, corrupted-save recovery and storage error feedback
- [x] Opt-in original WebAudio: separate mute, volume, ambience, species cues and immediate voice stop on silence
- [x] Six practice-based talent skills, 12 conditionally unlocked stories and earned résumé awards
- [x] Six paid journeys with exact cost, once-yearly gate, age-safe passport and distinct local artwork
- [x] Four original animals: adoption, naming, care, upkeep, ageing, memorials, two-living limit
- [x] Eight species-specific conditional pet stories with real bond and wellness effects
- [x] Explicit classic/casual/sporty silhouette selections with live preview before any charge
- [x] Pet pixel artwork inside the actual event and journal scenes; mobile category quick navigation

## Verification before any release
- [x] TypeScript and Vite production bundle compiled in GitHub Actions
- [x] Automated Node rules including deterministic long-horizon simulation
- [x] Chromium full scenario regression tests against compiled assets
- [x] Firefox and WebKit gameplay compatibility smoke checks
- [x] Real, not age-faked, complete-life browser scenario to ending
- [x] Genuine 390x844 mobile and 1440x900 desktop screenshots recorded
- [x] Git commit fingerprint visible in the game build (verify HEAD in CI after change)
- [ ] Human visual acceptance against the user's approved reference art and UX
- [ ] Manual tests on real mobile devices and mainstream desktop browsers
- [ ] Public Cloudflare preview exercised end-to-end on its actual URL, not only local preview
- [ ] Confirmed final content depth and story-chain acceptance
- [ ] User-approved merge and production promotion; exact production deployment confirmed

## No false-positive rule
A green unit test means the tested contract passed, not every scenario. A generated screenshot means a page rendered, **not** that the composition is approved. Tests that programmatically modify age exercise rendering/migration only, not the full game loop. All final claims must name the precise Git SHA and test run.

## Publication policy
- GitHub: `iamthekap/zoidlife`, PR #8 from `feature/zoidlife-storyboard-blue-red-20261111` to `main`.
- Cloudflare production branch is `feat/initial-web-foundation`. Do not alter it accidentally.
- To publish after approval, merge the verified PR into main, reproduce the exact tested tree on the configured production branch via a regular non-force commit, then confirm Cloudflare's deployed SHA and visit the real URL.
- Browser saves are per origin; users should export before switching domain or clearing site data.
