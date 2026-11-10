# Zoid Life — REA evidence and independent implementation
Date: 2026-11-10

## Source examined
User-supplied untrusted modified Android package:
- Filename: BitLife-mod-apk-v3.25.3-bitlifemodzapk.com.apk
- SHA-256: 4e540c1cf7cefa8d5b944313c016c9a940551d6d61aacfbd4ef1a2300de5e348
- Approximate size: 328 MB
- ZIP entries: 3,198
- Analysis method: static ZIP inventory, JSON inspection and metadata strings; NO installation or execution

## Verifiable observations from this specific package
1. **Unity and IL2CPP**: lib/arm64-v8a/libunity.so, libil2cpp.so and assets/bin/Data/Managed/Metadata/global-metadata.dat are present.
2. **Unity assets**: data.unity3d, datapack.unity3d, ScriptingAssemblies.json and RuntimeInitializeOnLoads.json exist.
3. ScriptingAssemblies.json contains 172 assembly entries, including Assembly-CSharp.dll.
4. RuntimeInitializeOnLoads.json has 107 initialization entries; named hooks include:
   - Assembly-CSharp / AgeUp / Setup
   - Assembly-CSharp / Game.Dynamic.CustomLives.CustomLifeController / Init
   - Assembly-CSharp / ScenarioPromoManager / Init
5. The IL2CPP metadata begins with standard magic 0xFAB11BAF, version 39 (0x27). Strings include class/field identifiers for relationships, careers, schooling, scenarios and finances.
6. The modified package also contains libmenu.so and TESTKEY-related signature entries, so origin, authenticity and malware safety are NOT established.

## Not established
- These metadata do not explain complete runtime behavior, event weighting or exact algorithms.
- They do not authenticate the APK as an official release.
- No app execution, runtime instrumentation or security bypass took place.
- Do not copy third-party code, original text, fonts, images, UI art, sound or other expressive content.

## Original implementation
- Character creation: src/characters.ts creates randomized biographies and original vector portraits.
- Life simulation: src/simulation.ts implements education, work, health, finance and relationships.
- Event catalog: src/events-plus.ts adds original age/context-sensitive choices in pt-BR and English.
- History/memory: src/main.ts stores events and cumulative outcomes locally.
- UI: browser-native, blue and white, responsive mobile/desktop, no login.

## Validation and gaps
- Run npm test and npm run build; also test real gameplay visually before launch.
- This research does not replicate BitLife. Zoid Life requires more development: family entities, advanced occupations, property, disease progression, inheritance, branching life courses and scenario variation.
- Preserve main as production and previews on feature branches.

## Cloudflare discrepancy
The 2026-11-10 screenshot resembles green styling in feat/initial-web-foundation, while current main contains a blue stylesheet. Passing GitHub Actions did not establish Cloudflare deployment.

Dashboard checklist:
Workers & Pages -> zoidlife -> Settings -> Build -> Branch control:
- Production branch: main
- Build: npm run build
- Deploy: npx wrangler deploy
- Preview builds: enabled; command npx wrangler preview
Then check that the active Cloudflare deployment SHA matches main, and test the public domain with a hard refresh on mobile and desktop.
