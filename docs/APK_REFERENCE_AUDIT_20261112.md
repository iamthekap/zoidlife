# Zoid Life — APK evidence-backed reference inventory (2026-11-12)

Reference input: user-supplied modified APK `BitLife-mod-apk-v3.25.3-bitlifemodzapk.com.apk`.
Method: **offline ZIP metadata and CSV-schema inspection only**, using Python zipfile/csv.
The APK was **not executed** and no third-party sprites, scripts, dialogue or binary blobs are copied into this repository.

## Verified evidence
- ZIP archive: 3,198 entries; 448,824,338 bytes total uncompressed (archive about 328 MB).
- Unity/IL2CPP artifacts exist: `lib/arm64-v8a/libunity.so`, `lib/arm64-v8a/libil2cpp.so`, `assets/bin/Data/Managed/Metadata/global-metadata.dat`.
- 32 `assets/genesis_*.csv` files. These are small CSVs (384 to 841 bytes in this package), **not a full export of the game's event content**.
- Inspected CSVs use a common header of 24 fields. Schema columns observed include `ScenarioID`, `IsEntryPoint`, `HeroAge`, `Filter`, `Style`, `Title`, `Body`.
- Name-level categories in those CSVs include family conversation, gifts, friendship, classmates, dating, crimes, lawsuits, NPC encounters, vampire-themed NPC encounters and content-gating/purchases.
- Example CSV sizes: `genesis_crime.csv` 814 bytes (3 CSV records including header), `genesis_lawsuit.csv` 610 bytes (2 records including header), `genesis_npc_attacks_vampire.csv` 822 bytes (2 records including header).

These filenames support a **category taxonomy**; they do not establish how careers, probabilities, premium features, supernatural abilities, monetization or events work during gameplay. In particular, a filename mentioning a vampire does not prove a playable vampire character exists.

## Original Zoid Life interpretation
Original, independently authored systems, not copies:
- Player-selected professions and study/experience requirements, including health, law, sport, arts and science.
- Optional supernatural identity available only in the **free custom character creator** (user's own Zoid Life game-design choice). Generated baby candidates remain ordinary humans.
- Age/context-gated bilingual event bank, family/bond choices, legal consequences, multi-generation saves and pixel-art scenes.
- Independent blue Zoid/red Life branding. The older PDF guide (2026-11-10) describes blue/white, superseded by later explicit user direction.

## Unverified and out of scope for the current static REA
Exact gameplay probabilities, original event texts and content, hidden algorithms, premium access rules, event graph completeness, large-scale career database, and live interactions. The APK is modified/untrusted, so it remains unopened as an executable. This audit does not claim complete disassembly or feature parity.

## Remaining implementation gap
More authored event chains, long-term academic specialization, medical specialization, sport leagues/season stats, complex family interactions, original art review on devices, accessible motions and full production acceptance. None of these should be described as finished without tests and evidence.
