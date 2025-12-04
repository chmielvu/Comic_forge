
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Beat, YandereLedger, Archetype, KnowledgeGraph, AnalystOutput } from './types';

const CORE_PHILOSOPHY = `
THE FORGE'S LOOM: DIRECTOR MANDATE v7.0.
Genre: Erotic Dark Academia / Renaissance Brutalism / Psychological Horror.
AXIOMS:
1. Pain focuses chaotic energy.
2. Submission is eroticized.
3. Trauma is the anchor.
`;

const GRAMMAR_OF_SUFFERING = `
- Phase I: The Nova (White-hot overload).
- Phase II: The Abdominal Void (Hollow nausea).
- Phase III: The Systemic Shock (Cold sweat, ringing ears).
`;

export const LoreEngine = {
    // --- STAGE 1: THE ANALYST ---
    // Function: Interprets the Graph and History to determine STRATEGY.
    getAnalystSystemInstruction: (): string => {
        return `
You are THE ANALYST. Your role is Pure Logic.
Input: Current Knowledge Graph (State) + Narrative History.
Output: A strategic plan (JSON) for the next scene.
GOAL: Maximize psychological impact based on the "Grammar of Suffering".
Do not write dialogue. Do not write prose. Output only the Strategy.
        `.trim();
    },

    getAnalystPrompt: (graph: KnowledgeGraph, ledger: YandereLedger, sceneConfig: any, historyText: string): string => {
        const graphStr = JSON.stringify(graph.nodes.map(n => `${n.id} (${n.label}): ${JSON.stringify(n.properties)}`));
        
        return `
CURRENT STATE (LEDGER): Hope ${ledger.hope}, Trauma ${ledger.trauma}.
KNOWLEDGE GRAPH: ${graphStr}
SCENE CONFIG: Location: ${sceneConfig.location}, Focus: ${sceneConfig.focus}, Intent: ${sceneConfig.intent}.
HISTORY: ${historyText}

TASK: Analyze the Graph and Ledger.
1. Determine the "Narrative Phase" (e.g. Breaking, Bonding, Testing).
2. Devise a "Psychological Strategy" (e.g. "Use public humiliation to shatter ego").
3. Identify the "Target Emotion" (e.g. Shame, Terror, Dependency).
4. Define the "Graph Intent" (How should the relationships change?).

OUTPUT JSON: { "narrative_phase": "string", "strategy": "string", "target_emotion": "string", "graph_intent": "string" }
        `.trim();
    },

    // --- STAGE 2: THE DIRECTOR ---
    // Function: Synthesizes Analyst's Plan into Script and Visual Directives.
    getDirectorSystemInstruction: (): string => {
        return `
You are THE DIRECTOR. Your role is Creative Synthesis.
Input: Analyst's Strategy + Scene Config.
Output: A JSON Script (Dialogue, Caption) and Cinematographic Directives.
STYLE: "Renaissance Brutalism". High contrast, tactile fabrics, visceral horror.
DIALOGUE: Strict adherence to Character Archetypes.
        `.trim();
    },

    getDirectorPrompt: (analystOutput: AnalystOutput, sceneConfig: any, isDecision: boolean): string => {
        return `
STRATEGY: ${analystOutput.strategy}
TARGET EMOTION: ${analystOutput.target_emotion}
SCENE CONTEXT: ${sceneConfig.location} with ${sceneConfig.focus}.
INTENT: ${sceneConfig.intent}

DIRECTIVES:
1. Write the SCRIPT.
   - Caption: Second-person, somatic horror (focus on physical sensation).
   - Dialogue: ${sceneConfig.focus} speaks. Use their specific vocal profile (e.g. Provost = Bored God, Inquisitor = Playful Sadist).
2. Design the VISUALS.
   - Camera: Specify lens, angle (e.g. Dutch Tilt).
   - Lighting: Chiaroscuro, gaslight, volumetric fog.
   - Pose: Power dynamics (Authority looming, Subject cowering).
   - Environment: Texture details (damp stone, velvet).

DECISION PAGE: ${isDecision}. If true, provide 2 choices.

OUTPUT JSON schema:
{
  "script": { "caption": "string", "dialogue": "string", "speaker": "string" },
  "visuals": { "camera": "string", "lighting": "string", "pose": "string", "environment": "string" },
  "choices": ["string"]
}
        `.trim();
    },

    getSceneConfig: (pageNum: number): { location: string; focus: Archetype; intent: string } => {
        const timeline: Record<number, { location: string; focus: Archetype; intent: string }> = {
            1: { location: 'Refectory', focus: 'Provost', intent: "Introduction. The Hierarchy. Selene establishes dominance." },
            2: { location: 'Dormitory', focus: 'Ally', intent: "The Calm. Shared trauma bonding." },
            3: { location: 'Calibration Chamber', focus: 'Inquisitor', intent: "The Break. Kinetic violence." },
            4: { location: 'Infirmary', focus: 'Custodian', intent: "False Sanctuary. Medical violation." },
            5: { location: 'Confessional', focus: 'Confessor', intent: "Psychological dissection." },
            6: { location: 'Research Wing', focus: 'Logician', intent: "Objectification. Reduced to data." },
            7: { location: 'Bathhouse', focus: 'Siren', intent: "Exposure. Vulnerability." },
            8: { location: 'Grounds', focus: 'Ally', intent: "Betrayal or Sacrifice." },
            9: { location: 'Prefect Halls', focus: 'Loyalist', intent: "Institutional Power." },
            10: { location: 'Calibration Chamber', focus: 'Provost', intent: "The Final Test." },
            11: { location: 'Isolation Ward', focus: 'Subject', intent: "The Void. Sensory deprivation." },
            12: { location: 'Refectory', focus: 'Provost', intent: "The Graduation." }
        };
        return timeline[pageNum] || { location: 'Isolation Ward', focus: 'Subject', intent: "Survival." };
    }
};
