# Zoid Life

Original browser-based life simulator, developed in the NOVA STEAM VERDE ecosystem.

- Choose from randomized lives or customize a person completely, including name, country, gender, face, hair, eyes and initial attributes.
- Progress year by year with choices, statistics, life history and cumulative consequences.
- Explore education, work, money, debt, relationships and health.
- Play in Brazilian Portuguese or English, without registration.
- Responsive blue/white design for phones and desktop.

## Develop

Node.js 22+ recommended.

    npm install
    npm test
    npm run dev
    npm run build

## Structure

- src/main.ts — UI, creation flow, local saves, navigation and story presentation
- src/characters.ts — randomized original faces and biographies
- src/simulation.ts — life systems and persistent transitions
- src/events-plus.ts — additional original bilingual events and age/context requirements
- tests/ — unit tests for each system
- docs/REA_ANALYSIS.md — evidence-based research scope and deployment checklist

## Cloudflare

Production should deploy from main with build command npm run build and deployment command npx wrangler deploy. For feature branches, enable preview builds and npx wrangler preview. GitHub Actions success alone does not prove active Cloudflare deployment.

Public domain: https://zoidlife.kapyoutub.workers.dev

Third-party game code and expressive assets are not copied or bundled.
