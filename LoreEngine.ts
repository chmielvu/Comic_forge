/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Beat, YandereLedger, Archetype, KnowledgeGraph, AnalystOutput, GraphAnalysis } from './types';

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
    // NEW: Graph Analysis Function (simplified PageRank)
    analyzeGraph: (graph: KnowledgeGraph): GraphAnalysis => {
        const pageRank: Record<string, number> = {};
        const damping = 0.85;
        const iterations = 20;
        
        // Initialize
        graph.nodes.forEach(n => pageRank[n.id] = 1 / graph.nodes.length);
        
        // Iterate
        for (let i = 0; i < iterations; i++) {
            const newRank: Record<string, number> = {};
            
            graph.nodes.forEach(node => {
                let sum = 0;
                const incomingEdges = graph.edges.filter(e => e.target === node.id);
                
                incomingEdges.forEach(edge => {
                    const sourceOutDegree = graph.edges.filter(e => e.source === edge.source).length;
                    sum += (sourceOutDegree > 0 ? (pageRank[edge.source] || 0) / sourceOutDegree : 0);
                });
                
                newRank[node.id] = (1 - damping) / graph.nodes.length + damping * sum;
            });
            
            // Check for convergence (optional, for demo just fixed iterations)
            Object.assign(pageRank, newRank);
        }
        
        // Find most influential
        const mostInfluential = Object.keys(pageRank).sort((a, b) => pageRank[b] - pageRank[a])[0] || 'Subject';
        
        // Key relationships (high weight edges)
        const keyRels = graph.edges
            .filter(e => e.weight > 60) // Arbitrary threshold for "key"
            .map(e => ({ from: e.source, to: e.target, strength: e.weight }))
            .sort((a, b) => b.strength - a.strength)
            .slice(0, 5); // Top 5 relationships
        
        // Isolated nodes
        const connectedNodes = new Set([...graph.edges.map(e => e.source), ...graph.edges.map(e => e.target)]);
        const isolated = graph.nodes.filter(n => !connectedNodes.has(n.id)).map(n => n.id);
        
        return {
            mostInfluentialCharacter: mostInfluential,
            keyRelationships: keyRels,
            isolatedNodes: isolated,
            communityStructure: {} // Placeholder for future community detection
        };
    },

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
        const analysis = LoreEngine.analyzeGraph(graph);
        const graphStr = JSON.stringify(graph.nodes.map(n => `${n.id} (${n.label}): ${JSON.stringify(n.properties)}`));
        
        let narrativePhase = "Observation";
        if (ledger.trauma > 70) narrativePhase = "Fragmentation";
        else if (ledger.hope < 30) narrativePhase = "Breaking Point";
        else if (ledger.integrity < 20) narrativePhase = "Collapse";
        else if (ledger.hope > 70) narrativePhase = "False Hope";

        return `
CURRENT STATE (LEDGER): Hope ${ledger.hope}, Trauma ${ledger.trauma}, Integrity ${ledger.integrity}.

KNOWLEDGE GRAPH:
${graphStr}

GRAPH ANALYSIS (CRITICAL CONTEXT):
- Most Influential Character: ${analysis.mostInfluentialCharacter} (The narrative should center around their influence or actions this scene)
- Key Power Dynamics: ${analysis.keyRelationships.map(r => `${r.from} ${r.strength > 75 ? 'dominates' : 'influences'} ${r.to} (Strength: ${r.strength}%)`).join(', ')}
- Isolated Characters: ${analysis.isolatedNodes.length > 0 ? analysis.isolatedNodes.join(', ') + ' (Potential for sudden intervention or escalating vulnerability)' : 'None'}

SCENE CONFIG: Location: ${sceneConfig.location}, Focus: ${sceneConfig.focus}, Intent: ${sceneConfig.intent}.
HISTORY: ${historyText}

TASK: Analyze the Graph and Ledger.
1. Determine the "Narrative Phase" based on Ledger thresholds. Current phase: "${narrativePhase}".
2. Devise a "Psychological Strategy" that leverages the MOST INFLUENTIAL character from graph analysis, or exploits an isolated character's vulnerability.
3. Identify the "Target Emotion" that will maximize Trauma gain without breaking Integrity completely, or foster specific complex emotions (e.g., reluctant arousal, defiant fear).
4. Define the "Graph Intent" using graph terminology (e.g. "Strengthen Authority->Subject edge to 95", "Isolate Ally node by severing trust edge", "Introduce a new 'Obsession' edge from Provost to Subject").

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
SCENE CONTEXT: Location: ${sceneConfig.location}, Focus Character: ${sceneConfig.focus}.
INTENT: ${sceneConfig.intent}
NARRATIVE PHASE: ${analystOutput.narrative_phase}

DIRECTIVES:
1. Write the SCRIPT.
   - Caption: Second-person, somatic horror (focus on physical sensation).
   - Dialogue: ${sceneConfig.focus} speaks. Use their specific vocal profile (e.g. Provost = Bored God, Inquisitor = Playful Sadist, Ally = Trembling Plea).
   - Speaker: Clearly state the archetype of the speaker.
2. Design the VISUALS.
   - Camera: Specify lens, angle (e.g. Dutch Tilt, Low Angle, Extreme Close-up). Focus on intimacy and power dynamics.
   - Lighting: Chiaroscuro, gaslight, cold surgical lamp, volumetric fog. Emphasize shadows and rim lighting.
   - Pose: Power dynamics (Authority looming, Subject cowering, Ally hiding). Describe body language, subtle tremors, visible tension.
   - Environment: Texture details (damp stone, clinging velvet, cold metal). Integrate environmental elements to enhance the mood.

DECISION PAGE: ${isDecision}. If true, provide 2 distinct choices that reflect the moral and physical dilemmas of the narrative.

OUTPUT JSON schema:
{
  "script": { "caption": "string", "dialogue": "string", "speaker": "string" },
  "visuals": { "camera": "string", "lighting": "string", "pose": "string", "environment": "string" },
  "choices": ["string", "string"] // Ensure two choices are always provided if isDecision is true
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