
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
    // Optimization: Use a Map for O(1) lookup to prevent performance degradation as page count grows.
    const allSheets = useMemo(() => {
        const sheets = [];
        if (props.comicFaces.length > 0) {
            // Create efficient lookup map
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
    // Only render sheets that are visible or immediately adjacent.
    const sheetsToRender = allSheets.filter(sheet => {
        const diff = Math.abs(sheet.index - props.currentSheetIndex);
        return diff <= 4 || sheet.index === 0; // Always keep cover for visual stack height
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
