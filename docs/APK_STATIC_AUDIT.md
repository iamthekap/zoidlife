# APK reference: verified static inventory, not a full reverse-engineering claim

Date: 2026-11-11
Input: user-provided untrusted file \`BitLife-mod-apk-v3.25.3-bitlifemodzapk.com.apk\` (local-only reference; **not committed to this repository**).

## Reproducible evidence
A Python \`zipfile.ZipFile(...).infolist()\` metadata-only inspection found:
- 3,198 archive entries, ~449 MB uncompressed.
- \`lib/arm64-v8a/libunity.so\`, \`lib/arm64-v8a/libil2cpp.so\`.
- \`assets/bin/Data/Managed/Metadata/global-metadata.dat\`.
- \`classes.dex\` ... Android bytecode resources.
- Unity managed resources and \`assets/bin/Data/sharedassets0.resource\`.
- Filename-level examples of social-event categories: \`assets/genesis_conversation_parent.csv\`, \`assets/genesis_argue_friend.csv\`, \`assets/genesis_gift_parent.csv\`, \`assets/genesis_crime.csv\`, \`assets/genesis_lawsuit.csv\`.

These are **package metadata facts**, not evidence of the original application's live mechanics, branching, code semantics or user-facing paywall behavior. Unity and IL2CPP are confirmed as packaged components; the file is **not executed**, and the code/asset data in the APK is not redistributed.

## Independent implementation decisions
Zoid Life uses an original TypeScript engine, original authored narrative, custom pixel SVG and local saves. Reference game concepts inform feature categories only, not source code/assets/text. No claim is made that the original APK was fully decompiled or functionally replicated.

## Current verified functional coverage
Character randomization and customization, phase visual progression, bilingual choice-based events, 11 player-selected professions, education, debt/investments/property, named family and friendships, yearly actions, age progression, end-of-life report, local save import/export, mobile/desktop responsive UI.

## Unfinished systems
Crime/justice and legal proceedings, multi-generation playable descendants, medical condition timelines, detailed relationships (breakups/affairs), advanced career promotions and job loss, custom world locations, sound design, accessible controls review, visual QA on physical devices, broad content expansion and original APK behavioral evidence.
