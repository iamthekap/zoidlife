# Zoid Life — Art direction and storyboard v1.1

The user-provided Gemini concept and specification establish this direction for the original game.

## Fixed brand
- **Zoid** = blue \`#3A86FF\`
- **Life** = red \`#FF0044\`
- UI background \`#F0F0F0\`; neutral \`#DDDDDD\`; text \`#222222\`.
- Buttons, active states, status displays and narrative cues should remain in the blue/red family.
- The source concept renders the age button green, **but that conflicts with the explicit brand rule**. In Zoid Life the age button uses red, while regular primary actions use blue.

## Character system
- Style: **Clean Pixel Simulation**, selective outlining, layered cel shading, maximum three tones per material.
- Baby: large head, seated full body, infant face and outfit.
- Child: 1:2.5 approximate head-to-body ratio, standing, school outfit.
- Teen: 1:3.5, casual outfit and stance.
- Adult: 1:4, confident posture.
- Senior: additional stage for completeness, retaining the adult genetic identity with appropriate age changes.
- The player profile's skin/hair/eye colors remain fixed across life stages unless a future player action explicitly changes them.

## Storyboard UI
- The **vertical timeline** anchors the central journal. Every attained phase gets a quadrinho/scene.
- The scenes are **original procedural pixel art**, built from modular SVG scenery + the same age-specific character. They are not the supplied concept image or extracted third-party assets.
- Stage scenes: newborn crib / school / adolescent café / adult office / senior garden.
- Profile+money remain in the top bar; life's choices appear above the timeline; stats remain readable; central +Age sits in the fixed bottom dock.
- Use a left rail on mobile, alternating panels around a central rail on wide screens.
- **Never display future milestones as if already lived**. Only display scenes unlocked at ages 0, 3, 12, 18 and 65.
- Recorded history provides stage summaries. Missing history receives neutral chapter descriptions; do not invent a job, school award or relationship.
- Existing textual history remains below the visual storyboards and older saves remain supported.

## Quality and release gates
- Browser smoke tests check responsive timeline, stage rendering, 4 initial stages, persistent genetic profile, consistent theme and no overflow.
- Node tests check milestone gating, history parsing, safe escaping, localization and scene rendering.
- Preview build first; production only after verified CI and user acceptance. Keep main as source and the configured Cloudflare production branch unchanged until a deliberate migration.
