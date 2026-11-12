# Zoid Life

Independent browser-based life simulator developed in the NOVA STEAM VERDE collection. The current `0.9.0` label is a **preview version**, not a claim of final production acceptance.

## Play
- Start immediately from three original, genetically distinct newborn candidates or create a completely free custom character.
- Progress annually through mandatory, bilingual choices. The chosen result, including actual stat and world changes, is stored in a chronological illustrated life journal.
- Spend a year taking different allowed actions, without repeating the same action for extra rewards.
- Use named parents, friends, classmates, partners and children; unlock school, 45 occupations, promotions, voluntary resignation, investment and redemption, home purchase, health, crime and generational progression.
- Portable, validated JSON life saves. Corrupted local saves can be downloaded for recovery before overwriting. Browser-storage failures are visible; the current life can still be exported.
- Blue **Zoid** / red **Life** brand. Original pixel art, pt-BR and English. No mandatory sign-in or paid API.

## Development
Node.js 22+:

```bash
npm install
npm test
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

The Playwright suite runs against the **compiled Vite preview** (`dist/`), not the Vite development server. Chromium exercises the full scenario suite, with additional Firefox and WebKit compatibility checks. CI records actual browser screenshots as downloadable artifacts.

## Source and deployment integrity
- `src/main.ts`: orchestration and UI
- `src/simulation.ts`: deterministic progression and action gates
- `src/chronicle.ts`: chronology-backed event records
- `src/save-io.ts`: portable save validation and recovery integration
- `src/storyboard.ts`, `src/event-scenes.ts`, `src/pixel-*`: original procedural art
- `tests/`: Node, 500-life invariants, full-life, mobile and cross-engine browser tests
- `docs/RELEASE_CHECKLIST.md`: acceptance criteria and production gate
- `docs/EXECUTION_CHECKPOINT.md`: durable continuation and evidence

The footer of each Vite build displays a short Git commit fingerprint, derived from the source tree at build time. **Compare that fingerprint to the tested commit** to detect stale deployed previews.

GitHub PR #8 supplies the Cloudflare preview URL. Cloudflare's configured production branch remains `feat/initial-web-foundation`; no production promotion should be inferred from a successful PR build. Use a non-force release commit and confirm the exact deployed tree only after approval.

No third-party game sprites, dialogue, audio or binary code are copied or bundled. The modified reference APK was inspected statically and does not establish functional parity.
