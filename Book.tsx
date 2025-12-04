
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
    // It only needs to re-run if comicFaces length changes or specific content updates.
    const sheetsToRender = useMemo(() => {
        const sheets = [];
        if (props.comicFaces.length > 0) {
            // Sheet 0: Front Cover (0) / Inside Cover (1)
            sheets.push({ front: props.comicFaces[0], back: props.comicFaces.find(f => f.pageIndex === 1) });
            
            // Subsequent sheets
            for (let i = 2; i <= TOTAL_PAGES; i += 2) {
                sheets.push({ 
                    front: props.comicFaces.find(f => f.pageIndex === i), 
                    back: props.comicFaces.find(f => f.pageIndex === i + 1) 
                });
            }
        } else if (props.isSetupVisible) {
            // Placeholder sheet for initial render behind setup
            sheets.push({ front: undefined, back: undefined });
        }
        return sheets;
    }, [props.comicFaces, props.isSetupVisible]);

    return (
        <div className={`book ${props.currentSheetIndex > 0 ? 'opened' : ''} transition-all duration-1000 ease-in-out`}
           style={ (props.isSetupVisible) ? { transform: 'translateZ(-600px) translateY(-100px) rotateX(20deg) scale(0.9)', filter: 'blur(6px) brightness(0.7)', pointerEvents: 'none' } : {}}>
          {sheetsToRender.map((sheet, i) => (
              <div key={i} className={`paper ${i < props.currentSheetIndex ? 'flipped' : ''}`} style={{ zIndex: i < props.currentSheetIndex ? i : sheetsToRender.length - i }}
                   onClick={() => props.onSheetClick(i)}>
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
