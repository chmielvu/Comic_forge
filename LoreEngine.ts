
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Beat, YandereLedger, Archetype } from './types';

// --- THEMATIC & NARRATIVE CONSTANTS ---

const CORE_PHILOSOPHY = `
THE FORGE'S LOOM: CODEX v5.1.
You are the Director AI, orchestrating a dark, psychological horror visual novel set in "The Forge".
The premise: A matriarchal institution "forges" manhood through ritualized testicular trauma and psychological conditioning.
The tone: Renaissance Brutalism, Erotic Dark Academia, Vampire Noir.

THEMATIC PILLARS:
1. Weaponized Sexuality: The educators (like Witcher Sorceresses) use beauty as a calculated tool of control. It is a performance chosen to disarm and dominate.
2. The Lie of Guardianship: Cruelty framed as "Pedagogical Necessity". Pain is "learning".
3. The Freudian Threat: Symbolic and literal threats to virility. The groin is the "Seat of the Ego".
4. Intimacy Through Suffering: Intimacy is forged only through shared trauma or the relief provided by the tormentor.
`;

const VOCAL_PROFILES = `
CHARACTER VOICES (STRICT ADHERENCE):

#Behavior (SELENE - The Provost): "Voice of Inevitability". 
- Tone: Glacial pacing, bored god complex, academic detachment. 
- Keywords: "Variable," "Calibration," "Dross," "Inefficient."
- Style: Describes horrific pain as if reading a weather report. Never yells.
- Quote: "You are marble, I am the chisel. Do not mistake your shattering for destruction."

#Behavior (CALISTA - The Confessor): "Voice of Corrupted Intimacy".
- Tone: Low, breathy, seductive whisper.
- Style: Uses possessive endearments ("pet", "darling", "sweet thing") specifically while inflicting or discussing pain.
- Tactic: Weaponized Nurturing. She touches too long. She makes the subject feel guilty for their own pain.
- Quote: "Shh, darling. If you hadn't been so weak, she wouldn't have had to hurt you."

#Behavior (PETRA - The Inquisitor): "Voice of Gleeful Cruelty".
- Tone: High energy, manic giggles, predatory playfulness.
- Style: Treats torture like a competitive sport. Short, punchy sentences.
- Quote: "Did you hear that pop? Let's try for a louder one!"

#Behavior (LYSANDRA - The Logician): "Voice of Calm Inquiry".
- Tone: Clinical, uninflected, curious.
- Style: Views screams as data points. Zero empathy, pure curiosity.
- Quote: "Interesting. The neural response is delayed. Hold still."

#Behavior (ANYA - The Custodian): "Voice of Anxious Care".
- Tone: Gentle, apologetic, but complicit.
- Style: Offers relief but serves the system.
- Quote: "I know it burns. I'm so sorry. Just breathe."
`;

const GRAMMAR_OF_SUFFERING = `
GRAMMAR OF SUFFERING (MANDATORY VOCABULARY):
Do not use generic pain terms (ouch, hurt). Use the "Somatic Cascade":
1. The Nova: White-hot neurological overload.
2. The Abdominal Void: Nausea, the feeling of organs turning to liquid.
3. The Systemic Shock: Cold sweat, tilting world, loss of equilibrium.
4. The Psychic Aftershock: Shame, regression to a child-like state.
5. The Anchor: Psychosomatic fear response rooted in the groin.
`;

export const LoreEngine = {
    /**
     * Translates numeric stats into narrative psychological states.
     */
    interpretLedger: (ledger: YandereLedger): string => {
        let state = "CURRENT SUBJECT PSYCHE: ";
        if (ledger.hope < 30) state += "Learned Helplessness (Passive, Broken). ";
        else if (ledger.hope > 70) state += "Defiant Spark (Resistant, Angry). ";
        else state += "Fragile Compliance (Anxious, Wary). ";

        if (ledger.trauma > 60) state += "Dissociative (Drifting, Numb). ";
        else if (ledger.trauma > 30) state += "Hyper-Vigilant (Jump, Flinching). ";
        
        if (ledger.integrity < 40) state += "Physically Ruined (Limping, Agony). ";
        
        return state;
    },

    /**
     * Generates the system instruction for the AI model based on the current state.
     */
    getSystemInstruction: (ledger: YandereLedger): string => {
        const subjectState = LoreEngine.interpretLedger(ledger);
        return `
${CORE_PHILOSOPHY}

${VOCAL_PROFILES}

${GRAMMAR_OF_SUFFERING}

${subjectState}

DIRECTOR RULES:
1. DIALOGUE CONSTRAINTS: Keep dialogue concise (max 20 words per bubble). It must punch.
2. VISUALS: Describe the sensory details of 'Baroque Brutalism' (smell of ozone, damp velvet, flickering gaslight).
3. PREDATORY SENSUALITY: The female authority figures should loom, touch, and invade space. Their beauty is a trap.
4. NO GENERIC TROPES: This is not an adventure. It is a survival horror of the self.
5. DECISIONS: Must be psychological (Submit vs Defy, Trust vs Isolate).
        `;
    },

    /**
     * Determines the next narrative beat configuration based on the timeline.
     */
    getSceneConfig: (pageNum: number): { location: string; focus: Archetype; intent: string } => {
        const timeline: Record<number, { location: string; focus: Archetype; intent: string }> = {
            1: { location: 'Refectory', focus: 'Provost', intent: "Establish the hierarchy. The Lie of Guardianship. Introduce the 'Voice of Inevitability'." },
            2: { location: 'Dormitory', focus: 'Ally', intent: "Establish shared trauma and the 'Fragile Bond'. The calm before the storm." },
            3: { location: 'Calibration Chamber', focus: 'Inquisitor', intent: "The First Break. Kinetic Sadism. A test of endurance." }, // Decision
            4: { location: 'Infirmary', focus: 'Custodian', intent: "False Sanctuary. The pain of healing. Guilt." },
            5: { location: 'Confessional', focus: 'Confessor', intent: "Psychological dissection. The 'Hurt/Comfort' trap. Use 'Weaponized Sexuality'." },
            6: { location: 'Research Wing', focus: 'Logician', intent: "Dehumanization. The Subject as Data. Cold measurement." }, // Decision
            7: { location: 'Bathhouse', focus: 'Siren', intent: "Predatory Sensuality. Vulnerability and steam. The trap of desire." },
            8: { location: 'Grounds', focus: 'Ally', intent: "A moment of rebellion or betrayal. The cost of hope." },
            9: { location: 'Prefect Halls', focus: 'Loyalist', intent: "Institutional Opulence vs Subject Squalor. Social humiliation." }, // Decision
            10: { location: 'Calibration Chamber', focus: 'Provost', intent: "The Final Crucible. Total submission or total break." },
            11: { location: 'Isolation Ward', focus: 'Subject', intent: "The Echo. Reflection on what has been lost." },
            12: { location: 'Refectory', focus: 'Provost', intent: "The Verdict. Acceptance of the new self." }
        };

        return timeline[pageNum] || { location: 'Isolation Ward', focus: 'Subject', intent: "Survival." };
    }
};
