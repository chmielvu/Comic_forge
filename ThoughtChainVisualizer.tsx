/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Beat } from './types';

interface Props {
    beat: Beat;
    isLoading: boolean;
}

export const ThoughtChainVisualizer: React.FC<Props> = ({ beat, isLoading }) => {
    // Only show if there's a thought chain or if it's currently loading
    if (!beat.thought_chain && !isLoading) return null;

    return (
        <div className="absolute top-2 left-2 right-2 bg-black/70 backdrop-blur-sm p-2 rounded text-xs font-mono text-green-400 z-50 border border-green-900/50">
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border-2 border-green-400 border-t-transparent rounded-full"></div>
                    <span>PROCESSING: Analyst → Director → Renderer...</span>
                </div>
            ) : (
                <div className="space-y-1">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Agent Pipeline Trace:</div>
                    <div className="text-gray-300">{beat.thought_chain}</div>
                </div>
            )}
        </div>
    );
};
