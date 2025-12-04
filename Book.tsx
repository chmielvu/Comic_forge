
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useMemo } from 'react';
import { ComicFace, TOTAL_PAGES } from './types';
import { Panel } from './Panel';

interface BookProps {
    comicFaces: ComicFace[];
    currentSheetIndex: number;
    isStarted: boolean;
    isSetupVisible: boolean;
    onSheetClick: (index: number) => void;
    onChoice: (pageIndex: number, choice: string) => void;
    onOpenBook: () => void;
    onDownload: () => void;
    onReset: () => void;
    isGatePageReady: boolean;
}

export const Book: React.FC<BookProps> = React.memo((props) => {
    // Memoize the sheet structure calculation. 
    // Optimization: Convert array to Map for O(1) lookup to avoid nested loops.
    const allSheets = useMemo(() => {
        const sheets = [];
        if (props.comicFaces.length > 0) {
            // Create lookup map
            const faceMap = new Map<number, ComicFace>();
            props.comicFaces.forEach(f => {
                if (f.pageIndex !== undefined) faceMap.set(f.pageIndex, f);
            });

            // Sheet 0: Front Cover (0) / Inside Cover (1)
            sheets.push({ index: 0, front: faceMap.get(0), back: faceMap.get(1) });
            
            // Subsequent sheets
            for (let i = 2; i <= TOTAL_PAGES; i += 2) {
                sheets.push({ 
                    index: i,
                    front: faceMap.get(i), 
                    back: faceMap.get(i + 1) 
                });
            }
        } else if (props.isSetupVisible) {
            // Placeholder sheet for initial render behind setup
            sheets.push({ index: 0, front: undefined, back: undefined });
        }
        return sheets;
    }, [props.comicFaces, props.isSetupVisible]);

    // DOM Windowing / Virtualization
    // Only render sheets that are visible or adjacent.
    // Index 0 is the cover. Index 2 is page 2/3.
    // The book transform depends on currentSheetIndex.
    // We render previous, current, and next sheet.
    const sheetsToRender = allSheets.filter(sheet => {
        // Always render the active sheet, the one before it, and the one after it
        // This handles the flip animation smoothly.
        const diff = Math.abs(sheet.index - props.currentSheetIndex);
        // Allow a wider range (e.g., 4) to ensure shadows/stacking look correct during fast flips
        return diff <= 4 || sheet.index === 0; // Always keep cover for stack visuals if close
    });

    return (
        <div className={`book ${props.currentSheetIndex > 0 ? 'opened' : ''} transition-all duration-1000 ease-in-out`}
           style={ (props.isSetupVisible) ? { transform: 'translateZ(-600px) translateY(-100px) rotateX(20deg) scale(0.9)', filter: 'blur(6px) brightness(0.7)', pointerEvents: 'none' } : {}}>
          {sheetsToRender.map((sheet) => (
              <div key={sheet.index} className={`paper ${sheet.index < props.currentSheetIndex ? 'flipped' : ''}`} 
                   style={{ 
                       zIndex: sheet.index < props.currentSheetIndex ? sheet.index : allSheets.length - sheet.index 
                   }}
                   onClick={() => props.onSheetClick(sheet.index)}>
                  <div className="front">
                      <Panel 
                        face={sheet.front} 
                        onChoice={props.onChoice} 
                        onOpenBook={props.onOpenBook} 
                        onDownload={props.onDownload} 
                        onReset={props.onReset}
                        isGatePageReady={props.isGatePageReady}
                      />
                  </div>
                  <div className="back">
                      <Panel 
                        face={sheet.back} 
                        onChoice={props.onChoice} 
                        onOpenBook={props.onOpenBook} 
                        onDownload={props.onDownload} 
                        onReset={props.onReset}
                        isGatePageReady={props.isGatePageReady}
                      />
                  </div>
              </div>
          ))}
      </div>
    );
});
