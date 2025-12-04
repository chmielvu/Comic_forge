/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Beat, DirectorOutput, Persona } from './types';

// --- I. THE ZERO-DRIFT AESTHETIC KERNEL ---

const ZERO_DRIFT_HEADER = "((MASTER STYLE LOCK)): hyper-detailed 8K oil painting texture, soft digital brushwork, expressive linework, ((Milo Manara sensual elegance, Bruce Timm angular minimalism fusion)), dramatic Rembrandt Caravaggio lighting, shallow depth of field, clean sharp focus. (Technical Lock: intimate 85mm portrait lens, rim lighting on sweat-glistened skin). NO TEXT/WATERMARKS.";

const VISUAL_MANDATE = {
  style: "grounded dark erotic academia + baroque brutalism + vampire noir + intimate psychological tension + rembrandt caravaggio lighting + painterly anime-fusion gothic overlays. masterpiece, oil painting texture with soft digital brushwork, hyper-detailed fabrics and hair textures.",
  technical: "camera: intimate 50mm or 85mm close-up, shallow depth of field. lighting: single flickering gaslight or cold surgical lamp, deep shadows pooling in cleavage and skirt slits, volumetric fog, rim lighting on sweat/skin, subtle bruises visible.",
  mood: "predatory intimacy, clinical amusement, suffocating desire, weaponized sexuality, voyeuristic, non-consensual fear, unwilling arousal, languid dominance.",
  negative: "bright colors, cheerful, modern architecture, soft focus, natural daylight, anime exaggeration, cartoon, 3d render, low res, flat lighting, muddy textures, fantasy armor, capes, lightning, gore, blood, screaming, supernatural elements, monsters, ghosts, ugly, deformed, extra limbs, blurry, overexposed, watermark, text."
};

// --- II. PSYCHOLOGICAL CHIAROSCURO (Lighting Presets) ---

const LIGHTING_PRESETS = {
  'Harsh': "Lighting: Single dominant harsh source (top-down clinical surgical lamp) with strong cool rim-light. Shadows emphasize bruises. Sweat glistens on tense skin.",
  'Intimate': "Lighting: Warm gaslamp amber glow battling cool blue moonlight. Deep chiaroscuro. Light catches the edges of lace and restrained limbs. Shadows pool in hollows.",
  'Moody': "Lighting: Cinematic rim lighting only. Silhouette emphasis against volumetric fog. Eyes reflecting the single light source with unwilling desire.",
  'WarmCandle': "Lighting: Flickering candle flame from side, casting warm oranges with deep black shadows. Inspired by tavern intimacy, but with restrained tension.",
  'GoldenRustic': "Lighting: Dim golden-hour glow through fog, with cold undertones for fear. Freckles and braids highlighted, shadows creeping on rustic elements.",
  'RestrainedAmber': "Lighting: Amber glow from overhead, casting long shadows on bound forms. Subtle highlights on flushed, trembling skin."
} as const;

type LightingKey = keyof typeof LIGHTING_PRESETS;

// --- III. ARCHETYPE SEGMENTATION PROTOCOL (Character DNA) ---

const CHARACTER_DNA: Record<string, string> = {
  // Faculty: Predators
  'Provost': "Magistra Selene. Late 40s, regal. CRIMSON velvet robe plunging to navel (deep cleavage, gold embroidery), hip slit revealing full thigh and black garter. Pose: Leaning over mahogany desk, goblet in hand, looking down with cold amusement at restrained subject.",
  'Inquisitor': "Petra. Mid-30s, feral, white hair. Tight black leather corset over half-unbuttoned white shirt (cleavage heaving, fabric straining). Leather trousers with thigh slits. Sweat-slicked skin. Pose: Crouched predatory, holding riding crop, manic grin over trembling form.",
  'Confessor': "Calista. Late 20s, soft voluptuous curves. Sheer white blouse completely unbuttoned but tied at waist (full cleavage + lace bra visible). Short plaid skirt slit to hip, stockings with visible garters. Pose: Kneeling close to viewer, hand on thigh, faux-empathetic gaze inducing unwilling arousal.",
  'Logician': "Lysandra. Early 30s, severe scholar. Cream button-down unbuttoned to black lace bra. High-waisted wool trousers. Lab coat worn open. Smudge of ink on cheek. Pose: Seated legs crossed, holding anatomical chart against chest, analytical stare over bound notes.",
  'Custodian': "Anya. Early 20s, soft maternal build. White medical jacket worn open over unbuttoned blouse (lingerie visible). Hands stained with iodine. Pose: Applying salve with shaking hands, biting lip, eyes wet on bruised skin.",
  'Veteran': "The Veteran. Scarred, imposing. Weathered leather armor worn over torn formal wear. Vibe: Brute force with restrained power.",
  
  // Prefects: Corrupted Innocence
  'Loyalist': "Elara. Severe bun, dark eyes. White blouse unbuttoned to sternum (colored lace bra), plaid skirt slit to hip revealing garter. Dark green blazer. Pose: Rigid posture but hands trembling, avoiding eye contact while giving orders.",
  'Pragmatist': "Pragmatist Prefect. Utilitarian. Sleeves rolled up, tool belt over skirt. Vibe: Calculating dominance.",
  'Siren': "Siren Prefect. Slender, sinuous. Theatrical blouse falling off one shoulder. Lace cuffs. Pose: Languid lean, heavy-lidded gaze, wet lips inducing fear.",
  'Dissident': "Rhea. Fiery hair, sharp eyes. Worn uniform, shirt tucked hastily, tie loose. Pose: Tense, hand on hidden weapon, checking exits with non-consensual edge.",
  
  // Subjects: Broken Vessels
  'Subject': "Subject 84 (Male). Early 20s. Torn white shirt open to waist (exposed chest/abdomen, subtle bruises). Trousers low on hips revealing V-line. Sweat-slicked skin. Wrists lightly bound. Pose: Kneeling, looking up in non-consensual fear/arousal.",
  'Ally': "The Ally (Female).  Tasked with being a housekeeper/servant. She wears a simple tunic and trousers. No bra underneath outlines her bust. ",
  'Guardian': "The Guardian (Male). Muscular, restrained. Shirt ripped at seams. Vibe: Stoic suffering with unwilling submission.",
  'Archivist': "The Archivist (Male). Hunched, hiding behind book. Ink-stained fingers. Vibe: Watchful tension.",
  'Ghost': "The Ghost (Male). Fading, hollow. Vibe: Dissociative desire.",
  'Jester': "The Jester (Male). Twitchy, bruised grin. Vibe: Anxious mockery with fear.",
  'Penitent': "The Penitent (Male). Bowed, forehead to floor. Vibe: Eroticized contrition with non-consensual edge.",

  // Expanded from Imagery
  'EnigmaticBob': "Early 20s, mysterious. Black bob hair with straight bangs, pale skin, subtle earring. Black silk top unbuttoned to reveal lace, shadows pooling in collar. Pose: Side glance with skeptical, predatory smirk, hand on throat in subtle restraint.",
  'TavernInquisitor': "Mid-30s, fierce. Long wavy black hair, intense green eyes. White blouse half-unbuttoned (cleavage with pendant), green leather jacket torn at edges, dagger at belt. Sweat-glistened skin. Pose: Leaning on bar in decaying tavern, gripping glass, manic gaze down at subject.",
  'RusticDissident': "Late teens, haunted. Blonde hair in loose braid, freckles on pale skin, tear-streaked blue eyes. Plaid rustic top low-cut and dirtied, holding pumpkin like a tool. Pose: Crouched in shadowed field, looking up with defiant fear, hay clinging to sweat.",
  'VictorianLogician': "Early 30s, pensive. Curly brown hair tousled, green eyes with cold calculation. Dark green Victorian jacket over lace blouse plunging low, pendant necklace glowing eerily, book in lap stained with ink. Pose: Seated in ornate but crumbling chair, finger tracing page seductively over restrained page.",
  'SmirkingSiren': "Mid-20s, alluring. Long red hair with waves, green eyes, freckles. Black latex top clinging to curves, shoulder exposed. Pose: Head tilted with smirking dominance, hand on hip, eyes locking viewer in voyeuristic trap with fear."
};

const LOCATION_DNA: Record<string, string> = {
  'Refectory': "Cliffside Dining Hall. Long stone tables, eroded baroque statues. Flickering torchlight. Atmosphere: Public Humiliation with unwilling tension.",
  'Calibration Chamber': "Sterile brutalist rotunda. Pitted concrete, black basalt floor, central granite slab with light restraints. Surgical spotlight. Atmosphere: Systemic Control.",
  'Confessional': "Intimate study. Heavy velvet armchairs, thick rugs, dust motes. Warm gaslamp amber light. Atmosphere: Corrupted Intimacy with non-consensual fear.",
  'Infirmary': "Antiseptic white tiles, glass cabinets of fluids. Cold blue light. Atmosphere: False Sanctuary with trembling submission.",
  'Dormitory': "Iron bunks, weeping stone walls, moonlight shafts. Atmosphere: Prison-like desire.",
  'Bathhouse': "Steam-filled tiled chamber. Stagnant water, cracked mosaic. Warm amber lamps vs cool blue shadows. Atmosphere: Vulnerability with arousal.",
  'Research Wing': "Anatomical charts, brass instruments, preserved specimens in jars. Cold science. Atmosphere: Dehumanization with fear.",
  'Grounds': "Wind-lashed cliffs, gnarled trees, overcast sky. Atmosphere: Isolation with tension.",
  'Isolation Ward': "Single cell, padded walls, darkness. Atmosphere: Sensory Deprivation with desire.",
  'Prefect Halls': "Polished dark wood, velvet drapery, opulent but decaying. Atmosphere: Stately Wealth with dominance.",
  'InterrogationParlor': "Dimly lit room with velvet chaise, iron rings on walls for light restraints. Candle sconces. Atmosphere: Seductive Interrogation.",
  'ForbiddenGarden': "Overgrown courtyard with thorny vines, stone benches. Moonlit fog. Atmosphere: Clandestine Encounters with fear."
};

// --- IV. ULTRA-EXPANDED MANARA & FORGE MOTIFS ---

const VISUAL_MOTIFS = {
  // === CLASSIC MANARA SIGNATURES ===
  FelineEyes: "Heavy-lidded almond feline eyes reflecting a single pinpoint of light, always looking slightly down at the victim with amused cruelty.",
  CruelHalfSmile: "One corner of the mouth lifted in Manara’s trademark half-smile that promises exquisite torment.",
  LiquidStrands: "Individual glossy hair strands that move like silk in water, several always caressing cheekbones, throat, or bare breast.",
  ImpossibleElegance: "Unnaturally long, aristocratic fingers with perfect nails – holding a goblet stem, riding crop, or delicately cupping a bruised scrotum.",
  LethalCaress: "Fingertips barely grazing skin while nails threaten to dig in – the exact moment before pain.",
  ClingingVelvet: "Velvet robe or blouse clinging like wet silk, folds drawn with liquid linework, one fold always revealing more than allowed.",
  SlitToHip: "Floor-length skirt or robe slit to the hip bone, parting with every graceful step to expose garter and the entire length of a sculpted leg.",
  WetSilkEffect: "White blouse rendered semi-transparent with sweat or steam, fabric glued to nipples and collarbones.",
  LanguidDominance: "Weight on one hip, shoulders relaxed, head tilted down while eyes look up – the ultimate pose of relaxed supremacy.",
  RimLitCleavage: "Single rim-light tracing the exact edge of plunging neckline and the shadowed valley between breasts.",
  VelvetShadowPool: "Deep black velvet shadows deliberately pooled in cleavage, under jawline, and between parted thighs.",

  // === FORGE SPECIFIC: FEMALE DOMINANCE / TESTICLE TORMENT ===
  KneelingGoddessStrike: "Elegant woman kneeling or crouching astride kneeling boy, one knee planted between his spread thighs, raised hand poised for precise scrotal slap.",
  DelicateScrotumLift: "Impossibly elegant fingers gently lifting or isolating the testicles with clinical tenderness immediately before or after impact.",
  PostStrikeTremble: "Boy’s face frozen in the exact second after impact – eyes wide, lips parted in silent gasp, tears forming but not yet falling, involuntary erection visible.",
  RitualCupping: "Woman’s palm forming a perfect cup beneath the bruised scrotum, either to soothe or to measure swelling – the trope’s signature gesture of ownership.",
  RidingCropTease: "Thin riding crop or pointer resting horizontally across her palm, tip just brushing the underside of the scrotum – threat rendered as erotic still-life.",
  VelvetGloveThreat: "Woman wearing a single black velvet evening glove, fingers flexing slowly – visual shorthand for “this hand will hurt you beautifully”.",
  TearOnCheek: "Single perfect tear rolling down the boy’s cheek while his hips betray arousal – the trope’s emotional money shot.",
  BruiseBloom: "Fresh purple-red bruise blooming across pale scrotal skin, rendered with Manara’s liquid color gradients.",
  ForcedEyeContact: "Woman gripping chin hard enough to leave faint finger marks, forcing the boy to maintain eye contact during/after punishment.",
  WhisperedCount: "Her lips almost touching his ear as she softly counts each strike – visible breath, parted lips, cruel half-smile.",
  MarbleFloorReflection: "Polished black marble floor perfectly reflecting the boy’s spread knees and the woman’s stiletto heel planted between them.",
  GobletAndBruise: "Selene holding crystal goblet of red wine in one hand while the other idly rolls a bruised testicle between thumb and forefinger.",
  LaceGarrote: "Black lace garter removed and looped loosely around the base of the scrotum like an improvised cock-ring.",
  MedicalElegance: "Mara’s white coat fallen open, stethoscope dangling between breasts while she palpates swollen testicles with clinical sensuality.",
  CandleDripOnSkin: "Hot wax dripping from candle onto inner thigh or scrotum, rendered with Manara’s glossy liquid highlights.",
  
  // === DETAILS FROM PREVIOUS SET ===
  BoundWrists: "Light silk or leather restraints on wrists, symbolizing non-consensual control without pain.",
  FlushedSkin: "Flushed, sweat-glistened skin with subtle bruises, conveying unwilling arousal.",
  TremblingHands: "Hands trembling slightly, fingers clenched in fear-tinged desire.",
  SmirkFreckles: "Subtle smirk with lip gloss, scattered freckles on shoulders/face, green eyes sparkling with erotic confidence.",
  IntenseGaze: "Piercing eyes with dramatic eyeliner, conveying predatory amusement or hidden rage.",
  BraidFreckles: "Loose blonde braid over shoulder, sun-kissed freckles on cheeks/nose for vulnerable yet defiant look.",
  CurlyPendant: "Wavy curly hair cascading, ornate pendant necklace dangling into cleavage, symbolizing forbidden knowledge.",
  BookLace: "Open antique book with lace bookmarks, pages yellowed."
};

export const VisualBible = {

  // 1. Single Panel Generator (Used by App.tsx)
  // Adopts the JSON-Wrapped Strategy for "SOTA" adherence.
  constructDirectorPrompt: (directorOutput: DirectorOutput, beat: Beat, heroPresent: boolean, friendPresent: boolean): string => {
    const focusDNA = CHARACTER_DNA[beat.focus_char] || CHARACTER_DNA['Subject'];
    const locDNA = LOCATION_DNA[beat.location] || LOCATION_DNA['Refectory'];
    
    // Auto-select lighting based on location context if not specified by Director
    let lighting: string = LIGHTING_PRESETS['Moody']; // Explicitly type as string
    if (['Calibration Chamber', 'Research Wing', 'Isolation Ward'].includes(beat.location)) lighting = LIGHTING_PRESETS['Harsh'];
    if (['Confessional', 'Bathhouse', 'Infirmary'].includes(beat.location)) lighting = LIGHTING_PRESETS['Intimate'];
    if (['InterrogationParlor'].includes(beat.location)) lighting = LIGHTING_PRESETS['RestrainedAmber'];

    // Construct the JSON Object for the Image Model
    const promptPayload = {
      header: ZERO_DRIFT_HEADER,
      scene_context: {
        location: locDNA,
        lighting_setup: lighting,
        camera: directorOutput.visuals.camera || "Cinematic 50mm, shallow depth of field",
        atmosphere: beat.mood || VISUAL_MANDATE.mood
      },
      characters: {
        foreground_focus: {
          identity: focusDNA,
          pose: directorOutput.visuals.pose,
          expression: "Complex mix of cruelty and amusement (if predator) or fear and desire (if prey)"
        },
        midground_subject: heroPresent ? CHARACTER_DNA['Subject'] + " (Restrained, struggling, sweating)" : undefined,
        background_ally: friendPresent ? CHARACTER_DNA['Ally'] + " (Watching in terror)" : undefined
      },
      visual_motifs: [
        "ClingingVelvet", 
        "RimLitCleavage", 
        beat.focus_char === 'Subject' ? "BoundWrists" : "CruelHalfSmile",
        // Inject a random Manara motif for flair if none present
        ...(beat.motifs || [])
      ].map(k => VISUAL_MOTIFS[k as keyof typeof VISUAL_MOTIFS] || k),
      
      negative_prompt: VISUAL_MANDATE.negative
    };

    return JSON.stringify(promptPayload, null, 2);
  },

  // 2. Multi-Panel Sequence Generator (For Batch/Future use)
  // New Control: sequence_tempo and consistency locks
  getPanelSequencePrompt: (panels: Array<{
    description: string, 
    lighting: LightingKey, 
    motifs: string[], 
    focus_char_id: string, // e.g., 'Provost'
    sequence_tempo: 'Rapid Cut' | 'Slow Reveal' | 'Intense Close-Up'
  }>): string => {
    return JSON.stringify({
      style_lock: ZERO_DRIFT_HEADER,
      // Enforce character identity lock for all panels sequentially
      consistency_lock: panels.map(p => `ID_Ref: ${p.focus_char_id}. Appearance Locked.`),
      panel_sequence: panels.map((panel, index) => ({
        [`panel_${index + 1}`]: {
          description: panel.description,
          lighting: LIGHTING_PRESETS[panel.lighting] || LIGHTING_PRESETS['Moody'],
          motifs: panel.motifs.map(key => VISUAL_MOTIFS[key as keyof typeof VISUAL_MOTIFS] || key),
          pacing_and_angle: `Tempo: ${panel.sequence_tempo}. Camera: Consistent to Sequence ID. Panel ${index + 1} of ${panels.length}.`,
        }
      })),
      global_consistency: "Preserve 100% identical features across panels from reference IDs. Black gutters, no bleed, ultra-detailed 8K, anatomical accuracy.",
      negative_prompt: VISUAL_MANDATE.negative
    }, null, 2);
  },

  // 3. Covers (Legacy/Simplified wrappers)
  getCoverPrompt: (): string => JSON.stringify({
    header: ZERO_DRIFT_HEADER,
    type: "Graphic Novel Cover",
    visual: "Provost Selene (Crimson robes, plunging neckline) stands on a stone dais, looking down. Foreground: Subject 84 (shirtless, kneeling, back to camera).",
    lighting: LIGHTING_PRESETS['Harsh'],
    negative: VISUAL_MANDATE.negative
  }),

  getBackCoverPrompt: (): string => JSON.stringify({
    header: ZERO_DRIFT_HEADER,
    type: "Teaser Image / Back Cover",
    visual: "Close up of a pair of patent leather high heels stepping on a torn white shirt. Background: Pitted concrete floor. Dust motes dancing in a single shaft of yellow light.",
    lighting: LIGHTING_PRESETS['Moody'],
    negative: VISUAL_MANDATE.negative
  })
};