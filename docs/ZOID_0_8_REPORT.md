# Zoid Life 0.8 — integrated preview acceptance

Reference: GitHub PR #8, branch feature/zoidlife-storyboard-blue-red-20261111.

## Gameplay delivered
- Original pixel avatars, four genetic skin tones, four hair styles, and six named wardrobe palettes. Distinct three-baby selection and user clothing choice; appearance persists.
- Original interactive vertical storyboard with real life chronology and five age phases.
- 11 jobs with prerequisites, persistent wages, financial consequences, and localized names.
- Named family/friends plus talk/gift/help actions, with per-year limits and costs.
- 58 authored bilingual age/context-gated event templates with consequences and history.
- Fictional long-term health conditions with treatment and life-stage effects.
- Fictional legal choices with records, fines, jail and employment restrictions.
- State-derived ending report, TXT export and playable child succession with ancestry, inheritance, and confirmation before replacement.
- Save validation, import/export, legacy migration and browser local storage.

## Brand and layout
Zoid blue #3A86FF, Life red #FF0044; white/light backgrounds, mobile and desktop, full-body pixel sprites. No mandatory login or paid APIs.

## Evidence gates
- Automated Node unit, stress, and Chromium suites run on the PR branch. CI uploads 9 browser screenshots (mobile/desktop newborns, chapter scenes, careers, legal choices, health, end of life/descendants and second generation).
- Cloudflare Workers Builds preview check must pass before any release.
- Tests verify functional behavior, not subjective visual quality on physical devices.
- Production remains unchanged; no branch switch required.

## Explicitly incomplete
Not a feature-for-feature copy of the reference game. The third-party APK was inspected only at package/metadata level, not fully reverse-engineered. Remaining areas include broader content, courts/appeals, long-term illnesses, job promotions/layoffs, school paths, rich NPC dialogue, locations, audio/animation, accessibility, and actual cross-device art acceptance.
