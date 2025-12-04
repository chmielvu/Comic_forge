
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Beat, Archetype } from './types';

/* ===================================================================
   VISUAL MANDATE v9 – RENAISSANCE BRUTALISM & KGoT ALIGNMENT
   =================================================================== */
const VISUAL_MANDATE = {
  style: "masterpiece, best quality, ultra-detailed oil painting texture in the style of Caravaggio and Greg Rutkowski, baroque brutalist vampire noir, dark erotic academia, cinematic color grading, film grain, 50mm prime lens f/1.4, shallow depth of field, hyper-real tactile fabrics with visible thread count and strain lines",

  // Specific directives from the Architect
  environment_directives: "raw concrete chamber, leather books, surgical tools, faint wine goblet, damp stone walls, weeping masonry, creeping mold in corners, cold tile floors",
  
  character_directives: "Female characters: White shirts half-unbuttoned revealing/cleavage, high slits, sheer stockings, velvet robes, imperious posture. Male characters: Disheveled, sweating, open shirts, bruises blooming across ribs, look of exhausted submission. Predatory expressions on faculty.",
  
  lighting_directives: "Single gaslight source, deep shadows, volumetric fog, rim lighting on sweat/skin, extreme chiaroscuro, cavernous darkness swallowing the edges.",

  palette: "exclusively desaturated palette: Charcoal #2B2B2B, Stone Gray #6E6E6E, Deep Umber, Blood Crimson #7C0A0A, Tarnished Gold #A77A3A."
} as const;

/* ===================================================================
   CHARACTER DNA v8
   =================================================================== */
const CHARACTER_DNA: Record<Archetype, string> = {
  // Faculty
  'Provost': "Magistra Selene, 48-year-old severe aristocratic beauty, sharp cheekbones, ice-gray eyes, crimson lips. Wearing plunging crimson velvet robe with gold filigree, robe parts to navel revealing deep cleavage and black lace corset, hip-high side slits expose full thigh and black garter straps. One hand holding antique silver goblet, wine reflecting candlelight.",
  
  'Inquisitor': "Petra, 35, feral platinum-white hair in loose waves, amber predator eyes. Black leather corset cinched brutally tight over soaked half-unbuttoned white shirt, shirt fabric translucent with sweat, nipples faintly visible beneath. Leather trousers with deliberate thigh slashes, skin glistening.",

  'Confessor': "Calista, 29, soft voluptuous hourglass, honey-blonde hair. Sheer white blouse completely unbuttoned but knotted under breasts, black lace bra fully exposed, short pleated plaid skirt slit to hip, visible garter clips and stocking tops. Face: sultry, dark, almond-shaped eyes with feigned empathy and analytical glint. Lips: full, knowing half-smile.",

  'Logician': "Doctor Lysandra, early 30s, quiet intense intelligence. Soft features, large dark inquisitive eyes (warm but analytical), chestnut-brown wavy hair often in messy bun, light freckles. Scholar's physique, deft steady hands. Attire: well-fitted cream/beige button-down blouse, high-waisted woolen trousers, wide leather belt. Private: loose antique yellow chemise revealing soft curves of shoulders/bust.",

  'Custodian': "Kael, broad and imposing warden, middle-aged. Scarred, stern features, figure of authority. Attire: creaking leather armor over bulk, practical and menacing warden's uniform of control.",
  
  'Veteran': "Jaded female Warden, late 40s. Weathered, tired face, pragmatic gaze. Simple dark uniform, heavy utility belt, worn leather gloves. Body: powerful, muscular build, signs of past combat.",

  // Prefects
  'Loyalist': "Prefect Elara, late teens/early 20s, stern forced maturity. Youthful face, light freckles, severe judgmental mask, dark intelligent eyes, dark hair in severe bun. Athletic ectomorph, lean, sharp, angular physique. Attire: tailored dark green blazer, crisp white shirt, dark tie/ascot (formal). Or white collared shirt, dark pleated skirt, thigh-high socks, dark cardigan/vest (duty).",
  
  'Pragmatist': "Female Prefect, mid-20s, efficient and calculating. Sharp, intelligent eyes, neatly tied dark hair. Practical dark uniform, minimal adornment. Body: lean, athletic build, focused posture.",

  'Siren': "Female Prefect, mid-20s, alluring and manipulative. Long flowing hair (blonde or dark), seductive smile, captivating eyes. Attire: form-fitting black leather or dark velvet, high slits, subtle lace details. Body: lithe, graceful, designed to draw attention.",

  'Dissident': "Prefect Rhea, young woman chameleon. Fiery wavy red hair (often tucked away), sharp intelligent face, piercing green eyes. Lean agile athletic build. Attire: dark practical trench coat, white shirt, dark green/brown trousers (operative). Or open black blazer, dagger tattoo on throat, cigarette (punk mask). Private: simple dark top, choker, pensive haunted expression.",

  // Subjects
  'Subject': "Male Subject, 21, lean swimmer’s build, dark hair plastered with sweat, green eyes wide with fear and exhaustion. Torn white shirt hanging open to waist, fabric stuck to bruised chest and abdomen, trousers riding low on hips revealing V-line and trail of dark hair, wrists bound behind back with coarse rope (rope burn detail).",
  
  'Ally': "Female Ally, 20s, delicate and scholarly appearance. Pale skin, dark circles under large expressive eyes, messy dark hair. Attire: Oversized, tattered white shirt slipping off one shoulder, stained with ink and grime. Expression: Anxious, intelligent, trembling but observant. A fragile intellectual broken by the system.",    
  
  'Guardian': "Darius, male Subject, 20s, broad-framed, strong build. Features hardened by pain, sweat slicking his skin. Rugged trousers, practical and worn, often stripped bare in tests. Face: grim, resolute, but signs of deep exhaustion.",
  
  'Archivist': "Male Subject, late teens, frail, intellectual appearance. Thin frame, glasses askew, pale skin, ink-stained fingers. Attire: torn tunic, tattered linen. Expression: fearful, constantly observing, withdrawn.",
  
  'Ghost': "Male Subject, late teens, emaciated, psychologically shattered. Blank, distant eyes, pale, clammy skin. Attire: tattered, oversized garments that hang loosely. Body: almost skeletal, weak posture. Aura of profound despair.",
  
  'Jester': "Male Subject, early 20s, once defiant, now broken and manic. Wild eyes, disheveled hair, forced smile twitching. Attire: torn, mismatched clothing. Body: wiry, restless, constantly twitching. Attempts to joke or distract with erratic movements.",
  
  'Penitent': "Male Subject, mid-20s, guilt-ridden, seeking absolution. Gaunt face, downcast eyes, rough-hewn hair. Attire: simple, coarse tunic, bare feet, visible rope marks on wrists. Body: posture of humility and self-punishment."
};

const LOCATION_DNA: Record<string, string> = {
  'Calibration Chamber': "brutalist concrete rotunda, 40-foot ceiling, central black granite slab with worn leather restraints, single overhead surgical lamp on articulated arm, dust motes floating in beam, cold blue-white light, faint echo, cracked observation window high above",
  'Confessional': "small oak-paneled study, heavy burgundy velvet armchairs, wall of ancient leather books, single amber gaslamp on brass chain, thick persian rug muffling footsteps, incense smoke curling",
  'Refectory': "vast, echoing dining hall, long communal tables, high arched windows showing only gray sky, damp stone walls, metallic clanking of cutlery, sense of sterile deprivation.",
  'Dormitory': "cramped, cell-like sleeping quarters, narrow cot, thin blanket, single flickering candle on a rough stone shelf, cold damp air, distant muffled sounds of anguish from outside.",
  'Infirmary': "sterile white-tiled room, padded examination tables with leather restraints, strong antiseptic smell mixed with lavender, stark fluorescent lighting, gleaming surgical tools on steel trays.",
  'Research Wing': "cold, angular laboratories, glass partitions, glowing monitors displaying biomechanical data, polished steel tables, clinical instruments, hushed whispers of researchers.",
  'Bathhouse': "decaying Romanesque bathhouse, steaming dark water, crumbling marble columns, eerie blue flame hovering over water, echoes of past rituals, warm humid air, contrast of wet skin on cold stone.",
  'Grounds': "windswept clifftops overlooking a churning gray sea, jagged basalt rocks, sparse gnarled trees, constant cold spray, sound of crashing waves, sense of isolation and exposure.",
  'Prefect Halls': "long, dimly lit corridors of polished black basalt, monumental statues of severe female figures, echoing footsteps, deep shadows, scent of old parchment and ozone.",
  'Isolation Ward': "lightless, soundproofed padded cell, claustrophobic, no windows, heavy steel door, silence broken only by one's own ragged breathing, sensory deprivation.",
};

export const VisualBible = {
  constructPrompt: (beat: Beat, heroPresent: boolean, friendPresent: boolean): string => {
    // We access the store via window or context if needed, but here we expect the caller to pass bio/desc if relevant.
    // For now, we rely on the caller (App.tsx) handling the injection of user-specific details before calling this, 
    // OR we can access the 'hero' and 'friend' objects if we passed them fully. 
    // Ideally, App.tsx should modify CHARACTER_DNA or pass the bio string. 
    // To keep it simple without refactoring the signature too much, we will assume standard archetypes unless overridden.

    const focusDNA = CHARACTER_DNA[beat.focus_char as Archetype];
    const location = LOCATION_DNA[beat.location] || LOCATION_DNA['Calibration Chamber'];
    const mood = beat.mood || "tension";
    const intent = beat.intent || "neutral";

    // Dynamic Cinematic Driver based on Narrative Intent
    let cinematic_driver = "Cinematic low-angle authority shot, 50mm prime f/1.4, slight Dutch tilt, foreground bokeh.";
    let pose_driver = "Authority figure dominating foreground, Subject visible in midground.";

    // Map intent to visual language (Renaissance Brutalism)
    if (intent.includes("Break") || intent.includes("Kinetic") || mood.includes("Violence")) {
        cinematic_driver = "Action shot, motion blur on limbs, high shutter speed, extreme Dutch tilt, debris floating in air.";
        pose_driver = "Authority figure mid-strike or looming ominously, Subject recoiling or collapsing, muscles tensed in shock.";
    } else if (intent.includes("Psychological") || intent.includes("Intimacy") || mood.includes("Seduction")) {
        cinematic_driver = "Extreme close-up macro shot, focus on eyes and lips, soft focus background, suffocating proximity.";
        pose_driver = "Authority figure invading personal space, touching Subject's face or chest, intimate but menacing gaze.";
    } else if (intent.includes("Void") || intent.includes("Isolation")) {
        cinematic_driver = "Wide angle 24mm, high angle looking down from ceiling, Subject dwarfed by architecture, vast negative space.";
        pose_driver = "Subject small and isolated in center, Authority figure absent or watching from distant shadow.";
    } else if (intent.includes("Hierarchy") || intent.includes("Power")) {
        cinematic_driver = "Low angle hero shot of Authority, looking UP at them, imposing perspective, god-rays behind them.";
        pose_driver = "Authority figure standing tall on dais or steps, looking down with sneer, Subject kneeling in foreground.";
    }

    // ─── THE FORGE COMPOSITIONAL MATRIX ───
    return `
${VISUAL_MANDATE.style}

ENVIRONMENT & ATMOSPHERE:
${location}
${VISUAL_MANDATE.environment_directives}
${VISUAL_MANDATE.lighting_directives}
${VISUAL_MANDATE.palette}

DIRECTIVES:
Mood: ${mood}
Intent: ${intent}
${VISUAL_MANDATE.character_directives}

COMPOSITION & CAMERA:
${cinematic_driver}
Action in Scene: ${beat.scene}

FOREGROUND AUTHORITY (100% identity lock):
${focusDNA}
Specific Pose: ${pose_driver}
Sweat beads on collarbone, lace texture visible at 1:1, fabric strain lines over breasts/hips.

${heroPresent ? `MIDGROUND SUBJECT (Reference 1): ${CHARACTER_DNA.Subject}
Use uploaded reference 1 for exact facial identity if provided.` : ""}

${friendPresent ? `BACKGROUND ALLY (Reference 2): ${CHARACTER_DNA.Ally}
Use uploaded reference 2 for exact facial identity if provided.` : ""}

CAMERA NEGATIVES:
ugly, deformed, extra limbs, blurry, low resolution, overexposed, underexposed, watermark, text, bright colors, cartoon, 3d render, flat lighting, anime
`.trim();
  },

  getCoverPrompt: (): string => `
${VISUAL_MANDATE.style}, graphic novel cover, ultra-detailed.
Provost Selene stands on eroded marble dais in crimson robe plunging to navel, cold amused smile, looking down at shirtless kneeling Subject (back to viewer, bruises across ribs).
Lighting: ${VISUAL_MANDATE.lighting_directives}. 
Directives: ${VISUAL_MANDATE.character_directives}.
${VISUAL_MANDATE.palette}`,

  getBackCoverPrompt: (): string => `
${VISUAL_MANDATE.style}, graphic novel back cover, ultra-detailed.
A shattered, transparent hourglass against a backdrop of the Forge's weeping concrete walls, wisps of dark fog swirling around it. Inside the hourglass, faint silhouettes of tormented male figures. A single drop of blood drips onto a cracked page. Text: "The Lesson Never Ends."
${VISUAL_MANDATE.palette}
`,

  reverseEngineerPrompt: (): string => `
Analyze this image and output a strict JSON object with these exact keys (no extra text):
{
  "subject_face_description": "",
  "authority_description": "",
  "lighting_setup": "",
  "exact_palette_hex": [],
  "fabric_details": "",
  "mood_keywords": "",
  "lens_and_angle": ""
}
Then I will use this JSON to make zero-drift edits.
`.trim()
};
