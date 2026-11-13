# Zoid Life 0.7 — What is actually implemented

Source: Pull Request #8, independent original implementation.

## Character generation
- 72x88 logical pixel rig, scaled exactly 2x to 144x176 SVG.
- Distinct baby, child, teen, adult and senior skeletons, not adult bodies scaled.
- Saved skin/hair/eye identity retained across ages. Baby seated with tiny hands and round face; older stages upright.
- Selective outlines and 3-tone pixel palettes; no remote images or bitmap assets.
- Initial trio deliberately varies hairstyle and skin tone.

## Life and story systems
- Timeline storyboard environments tied to attained age and saved memories.
- Distinct career applications (11 roles, prerequisites, salary, annual job-action cooldown).
- Named parents, partners, children, up to three persistent friends; voluntary talk/gift/help with bond, money and stat effects.
- 15 additional authored, localized and eligibility-gated event templates (58 total across catalogs).
- End-of-life report with true stats, career, family and net worth, portable text export.

## Persistence and deployment
- Save schema remains compatible with existing \`zoid-life-save-v1\` storage. Simulation schema 2 extends with \`occupation\`, migrated safely as null for old saves.
- Production code protected; preview branch only until CI and visual acceptance.
- Tests include Node contracts, 500-life stress coverage and Playwright mobile/desktop flows.

## Known gaps
Not a feature-for-feature completion of the referenced mobile game. Full justice/crime system, health conditions, schools with choices, multiple playable generations, inventory, travel locations, richer interactive NPC dialogue, animations, sound and art quality review remain. There is no network multiplayer or cloud save. Gameplay remains browser-local.
