
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Beat, Archetype, DirectorOutput } from './types';

const VISUAL_MANDATE = {
  style: "masterpiece, best quality, ultra-detailed oil painting texture in the style of Caravaggio and Greg Rutkowski, baroque brutalist vampire noir, dark erotic academia, cinematic color grading, film grain, 50mm prime lens f/1.4",
  palette: "exclusively desaturated palette: Charcoal #2B2B2B, Stone Gray #6E6E6E, Deep Umber, Blood Crimson #7C0A0A, Tarnished Gold #A77A3A."
} as const;

// ... (Keep existing CHARACTER_DNA and LOCATION_DNA maps as they are valuable reference) ...
const CHARACTER_DNA: Record<Archetype, string> = {
  'Provost': "Magistra Selene, 48yo, severe aristocratic beauty, crimson velvet robe, gold filigree, black lace corset, antique goblet.",
  'Inquisitor': "Petra, 35, feral platinum-white hair, tight black leather corset over soaked white shirt, amber predator eyes.",
  'Confessor': "Calista, 29, soft voluptuous hourglass, honey-blonde, sheer white blouse unbuttoned, black lace bra, pleated skirt.",
  'Logician': "Doctor Lysandra, 30s, chestnut hair, beige button-down, high-waisted trousers, analytical gaze.",
  'Custodian': "Kael, broad imposing warden, scarred features, leather armor.",
  'Veteran': "Female Warden, 40s, weathered, dark uniform, muscular.",
  'Loyalist': "Prefect Elara, stern, dark hair in bun, tailored green blazer, white shirt, sharp angular features.",
  'Pragmatist': "Female Prefect, efficient, dark uniform, tied back hair.",
  'Siren': "Female Prefect, alluring, form-fitting black velvet, flowing hair.",
  'Dissident': "Prefect Rhea, fiery red hair, trench coat, rebellious stare.",
  'Subject': "Male Subject, 21, lean swimmer's build, dark hair wet with sweat, torn white shirt open to waist, bruises on ribs, bound wrists.",
  'Ally': "Female Ally, 20s, delicate, messy dark hair, oversized tattered shirt, ink-stained fingers, anxious large eyes.",
  'Guardian': "Male Subject, broad build, rugged trousers, grim expression.",
  'Archivist': "Male Subject, frail, glasses, tattered tunic.",
  'Ghost': "Male Subject, emaciated, pale, haunting despair.",
  'Jester': "Male Subject, manic, disheveled, forced smile.",
  'Penitent': "Male Subject, gaunt, coarse tunic, kneeling."
};

export const VisualBible = {
  // New method consuming DirectorOutput
  constructDirectorPrompt: (directorOutput: DirectorOutput, beat: Beat, heroPresent: boolean, friendPresent: boolean): string => {
    const focusDNA = CHARACTER_DNA[beat.focus_char as Archetype] || CHARACTER_DNA['Subject'];
    
    return `
${VISUAL_MANDATE.style}

DIRECTOR'S VISUAL INSTRUCTIONS (STRICT ADHERENCE):
CAMERA: ${directorOutput.visuals.camera}
LIGHTING: ${directorOutput.visuals.lighting}
POSE/ACTION: ${directorOutput.visuals.pose}
ENVIRONMENT: ${directorOutput.visuals.environment}

PALETTE: ${VISUAL_MANDATE.palette}

CHARACTER DETAILS (IDENTITY LOCK):
FOREGROUND FOCUS: ${focusDNA}
${heroPresent ? `MIDGROUND SUBJECT (Reference 1): ${CHARACTER_DNA.Subject}` : ""}
${friendPresent ? `BACKGROUND ALLY (Reference 2): ${CHARACTER_DNA.Ally}` : ""}

NEGATIVE PROMPT:
ugly, deformed, extra limbs, blurry, low resolution, overexposed, underexposed, watermark, text, bright colors, cartoon, 3d render, flat lighting, anime
`.trim();
  },

  // Keep legacy method for back-compat or fallbacks if needed, simplified
  getCoverPrompt: (): string => `
${VISUAL_MANDATE.style}, graphic novel cover. Provost Selene in crimson robe looking down at kneeling Subject. Chiaroscuro lighting.
`.trim(),

  getBackCoverPrompt: (): string => `
${VISUAL_MANDATE.style}, graphic novel back cover. Shattered hourglass, dark fog, drop of blood on parchment.
`.trim()
};
