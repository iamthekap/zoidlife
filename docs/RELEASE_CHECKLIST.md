# Zoid Life — v0.5 technical acceptance

## Live UI contract
- Loading screen followed immediately by three generated babies on a full-screen entry view.
- Each baby's full-body seated artwork comes from the same saved appearance profile used in childhood, adolescence, adulthood and senior years.
- A fully free character editor is available before starting; no login or purchase is required.
- The gameplay journal and contextual scenario art are backed by persistent events and choices.
- The central **+ Age** button stays at the center of the bottom game dock on phones and desktops and is disabled while a decision is pending.
- Status header shows the active character, age and bank balance.
- Four dock categories: career, finances, relationships and activities, with main journal accessible from the player header.
- Named family members, partners and children persist and grow older with the player. Spending time changes bond and consumes the year's voluntary action.
- Events: 8 legacy/story events, 16 original additional events and 19 data-driven scenario events (43 authored templates) with age, contextual eligibility, four-year repeat cooldown and persistent world outcomes.
- All content and illustrations are authored for Zoid Life, not extracted from the supplied reference APK.

## Production release process
Main: authoritative code / PR merge target.
Cloudflare's currently configured production branch is feat/initial-web-foundation, a legacy setting which previously fixed a broken build. **Do not change this setting without a reason.**
Preview: feature branches automatically build with Cloudflare, and the preview link appears on the pull request.
Release: after CI + visual acceptance, reproduce the tested main tree exactly on feat/initial-web-foundation using a non-force commit. Compare tree SHAs and confirm Cloudflare production build+version. This creates one production build instead of experimenting repeatedly on the public domain.
GitHub Actions CI requires:
- unit and long-horizon stress tests
- TypeScript compile
- Vite bundle
- Playwright Chromium tests on mobile/desktop and legacy save migration

## Known limitations
- Static APK inspection cannot establish full gameplay behavior; reference material is used only as an abstract functional benchmark.
- More interactive NPC interactions, jobs, relationships, school systems, illness modeling and visual polish are possible in future releases.
- A passing CI does not prove every device or situation is bug-free.
- localStorage saves live on a particular device/browser. Clearing site storage removes them. A portable save export is a proposed next feature.
