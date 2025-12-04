
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Beat, Persona, Archetype } from './types';

// --- VISUAL BIBLE v5.1: RENAISSANCE BRUTALISM & VAMPIRE NOIR ---

const VISUAL_MANDATE = {
  style: "style: grounded dark erotic academia + baroque brutalism + vampire noir + intimate psychological horror + rembrandt caravaggio lighting. masterpiece, oil painting texture.",
  technical: "camera: intimate 50mm or 85mm close-up, shallow depth of field. lighting: cinematic rembrandt lighting, volumetric gaslight with cool blue rim-light to separate subject from background, deep shadows but detailed midtones, atmospheric fog.",
  mood: "mood: predatory intimacy, clinical amusement, suffocating dread, weaponized sexuality.",
  negative: "bright colors, cheerful, modern architecture, soft focus, natural daylight, explicit nudity, graphic violence, anime, cartoon, 3d render, low res, underexposed, crushed blacks, illegible, too dark, flat lighting, muddy textures."
};

const LIGHTING_PRESETS = {
    'Harsh': "Lighting: Single dominant harsh source (top-down clinical or spotlight) with strong cool rim-light.",
    'Intimate': "Lighting: Warm gaslamp amber glow battling cool blue moonlight, rim lighting on hair and shoulders, soft fill.",
    'Moody': "Lighting: Cinematic rim lighting, silhouette emphasis against volumetric fog, deep chiaroscuro but visible faces."
};

export const PALETTE_TOKENS = "Palette: Charcoal #2B2B2B, Stone Gray #6E6E6E, Deep Umber, accents of Blood Crimson #7C0A0A and Tarnished Gold #A77A3A.";

// --- CHARACTER VISUAL DNA (Archetype Mapping) ---
const CHARACTER_DNA: Record<Archetype, string> = {
    // Faculty
    'Provost': "Character: Magistra Selene (The Zealot/Queen). Physique: Statuesque, towering, hourglass. Face: Severe beauty, sharp jaw, cold gray eyes, tight complex braids. Attire: Crimson velvet robes with plunging neckline, ornate silver lion brooch. Vibe: Bored god complex, regal dominance.",
    'Inquisitor': "Character: Petra (The Sadist). Physique: Athletic, wiry, coiled tension. Face: Manic grin, piercing green eyes, dilated pupils, wild white hair. Attire: Tight green tank top, leather harness, fur-collared coat. Vibe: Kinetic energy, exhilarated cruelty.",
    'Confessor': "Character: Calista (The Siren/Psychologist). Physique: Voluptuous, soft curves, heavy-lidded. Face: Sultry brown eyes, wet lips, faux-empathetic smile. Attire: Off-shoulder sapphire blouse, corset, translucent fabrics. Vibe: Languid, wet, weaponized softness.",
    'Logician': "Character: Lysandra (The Perfectionist). Physique: Thin, precise, stiff. Face: Pinch, focused, icy blue eyes, ash-blonde braid. Attire: Pristine gray tunic, high collar, brass instruments. Vibe: Clinical, detached, measuring tape.",
    'Custodian': "Character: Anya (The Nurse). Physique: Soft, fuller curves, maternal. Face: Kind open face, flushed cheeks, anxious. Attire: White medical jacket over unbuttoned blouse, satchel. Vibe: Warm, clinical, false-comfort.",
    'Veteran': "Character: The Veteran. Physique: Craggy, scarred, imposing. Attire: Weathered leather armor. Vibe: Bitter cynicism, brute force.",
    
    // Prefects
    'Loyalist': "Character: Loyalist Prefect. Physique: Rigid posture. Attire: Dark green blazer, pleated skirt, green ascot. Vibe: Stern conviction, brittle authority.",
    'Pragmatist': "Character: Pragmatist Prefect. Physique: Hands-on, sturdy. Attire: Utilitarian tunic, tool belt. Vibe: Calculating.",
    'Siren': "Character: Siren Prefect. Physique: Slender, sinuous. Attire: Theatrical blouse, lace cuffs. Vibe: Predatory warmth.",
    'Dissident': "Character: Dissident Prefect. Physique: Tense, agile. Attire: Worn clothes, messy braid. Vibe: Guarded, intense.",

    // Subjects (The Victims)
    'Subject': "Character: The Subject (Male). Physique: Gaunt, exhausted, trembling. Face: Sweat-slicked, pale, wide eyes. Attire: Simple grey tunic, torn, exposed collarbone. Vibe: The Martyr, suffering, beautiful agony.",
    'Ally': "Character: The Ally (Male). Physique: Frail, breaking. Attire: Ragged tunic. Vibe: Desperate loyalty, hollow fear.",
    'Guardian': "Character: The Guardian (Male). Physique: Muscular but restrained. Attire: Reinforced tunic. Vibe: Protective, stoic.",
    'Archivist': "Character: The Archivist (Male). Physique: Hunched, hiding. Attire: Hooded cardigan. Vibe: Watchful, intelligent.",
    'Ghost': "Character: The Ghost (Male). Physique: Hollow, fading. Vibe: Dissociative, haunted.",
    'Jester': "Character: The Jester (Male). Physique: Twitchy, restless. Attire: Patchwork. Vibe: Anxious mockery.",
    'Penitent': "Character: The Penitent (Male). Physique: Bowed, kneeling. Vibe: Earnest contrition, zealous."
};

// --- LOCATION MASTER PROMPTS ---
const LOCATION_DNA: Record<string, string> = {
    'Refectory': "Location: Cliffside Dining Hall. Wide shot. Long stone tables, eroded baroque statues fused into brutalist concrete. Flickering torchlight. Atmosphere: Social humiliation.",
    'Calibration Chamber': "Location: The Calibration Chamber. Sterile brutalist rotunda. Pitted concrete walls, black basalt floor, central granite slab. Clinical overhead light pool. Atmosphere: Systemic Shock.",
    'Confessional': "Location: The Confessional. Intimate study. Heavy velvet armchairs, thick rugs, blurred book stacks. Warm gaslamp amber light, dust motes. Atmosphere: Corrupted Intimacy.",
    'Infirmary': "Location: The Infirmary. Shelves of glass bottles and salves. Amber lamplight pooling on a healing cot. Smell of herbs. Soft shadows. Atmosphere: False Sanctuary.",
    'Dormitory': "Location: Subject Dormitory. Minimalist bunks, narrow windows with blue moonlight shafts. Rough concrete walls. Cold, prison-like.",
    'Bathhouse': "Location: Steam Pools. Dusk. Carved stone pools, worn mosaic tiles. Warm amber lamps vs cool blue shadows. Steam haze. Atmosphere: Vulnerability and steam.",
    'Research Wing': "Location: Research Lab. Glass observation rooms, brass analog dials. Pitted concrete. Desaturated stone-bronze palette. Cold science.",
    'Grounds': "Location: Cliffside Grounds. Wind-lashed paths, gnarled trees, ritual circles. Overcast sky, distant brutalist silhouettes. Nature as antagonist.",
    'Isolation Ward': "Location: Isolation Cell. Stark concrete, single overhead bulb. Heavy shadows. Claustrophobic.",
    'Prefect Halls': "Location: Prefect Halls. Polished dark wood, velvet drapery, baroque flourishes. Reflective surfaces. Stately wealth."
};

export const VisualBible = {
    /**
     * Constructs a modular prompt based on the "Compositional Trinity": Gaze, Pose, Environment.
     */
    constructPrompt: (beat: Beat, subject: Persona, ally: Persona | null): string => {
        const charDNA = CHARACTER_DNA[beat.focus_char] || CHARACTER_DNA['Subject'];
        const locDNA = LOCATION_DNA[beat.location] || LOCATION_DNA['Refectory'];
        
        // Determine Lighting based on Location/Mood
        let lighting = LIGHTING_PRESETS['Moody'];
        if (['Calibration Chamber', 'Research Wing', 'Isolation Ward'].includes(beat.location)) lighting = LIGHTING_PRESETS['Harsh'];
        if (['Confessional', 'Bathhouse', 'Infirmary'].includes(beat.location)) lighting = LIGHTING_PRESETS['Intimate'];

        // The "Compositional Trinity" Construction
        let prompt = `${VISUAL_MANDATE.style} ${VISUAL_MANDATE.technical} ${VISUAL_MANDATE.mood} ${PALETTE_TOKENS}\n`;
        prompt += `SETTING: ${locDNA}\n`;
        prompt += `LIGHTING: ${lighting}\n`;
        
        prompt += `\n--- COMPOSITION (Psychological Horror) ---\n`;
        prompt += `SCENE ACTION: ${beat.scene}. Use a cinematic angle to emphasize power dynamics (e.g. low angle looking up at authority, or high angle looking down at subject).\n`;
        
        // Subject Description
        prompt += `SUBJECT (Foreground/Midground): ${CHARACTER_DNA['Subject']} (Reference 1). Pose: ${beat.focus_char === 'Subject' ? 'Central focus, struggling or enduring' : 'Submissive, kneeling, or reacting to authority'}. Skin texture: Sweat-slicked, high detail.\n`;

        // Focus Character Description (The "Predatory" element)
        if (beat.focus_char !== 'Subject') {
             prompt += `FOCUS CHARACTER (Dominant): ${charDNA}. Focus on "The Gaze" (looking down, predatory, analytical) and "The Pose" (looming, invading space, chin tilt). Fabric strain on clothing. \n`;
        }
        
        if (beat.focus_char === 'Ally' && ally) {
             prompt += `ALLY: ${CHARACTER_DNA['Ally']} (Reference 2). Pose: Huddled or supporting.\n`;
        }

        prompt += `\nNEGATIVE PROMPT: ${VISUAL_MANDATE.negative}`;

        return prompt;
    },

    getCoverPrompt: (): string => {
        return `${VISUAL_MANDATE.style} TYPE: Graphic Novel Cover. VISUAL: A towering, statuesque female authority figure (The Provost) in crimson velvet robes stands on a stone dais, looking down with cold amusement. In the foreground, a kneeling male subject (seen from behind or profile), bare-shouldered, head bowed. SETTING: Eroded marble columns, heavy shadows. LIGHTING: Dramatic rim light, gaslamp glow. Title space at top. ${VISUAL_MANDATE.negative}`;
    },

    getBackCoverPrompt: (): string => {
        return `${VISUAL_MANDATE.style} TYPE: Teaser Image. VISUAL: A close-up of an ornate iron shackle resting on a faded velvet cushion. Beside it, a glass vial of poppy liquid. Background: Pitted concrete wall with a faint chalk mark. LIGHTING: Single shaft of yellow light. TEXTURE: Dust, scratches, realism. ${VISUAL_MANDATE.negative}`;
    }
};
