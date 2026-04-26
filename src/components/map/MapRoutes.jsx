import React from 'react';
import { Polyline } from 'react-leaflet';

export default function MapRoutes({
                                      directionsMode,
                                      navigating,
                                      activeAlts,
                                      activeRoute,
                                      selectedAltIdx,
                                      setSelectedAltIdx,
                                      remainingLine,
                                      completedLine,
                                  }) {
    return (
        <>
            {/* Greyed-out completed segment */}
            {completedLine?.length >= 2 && (
                <Polyline
                    positions={completedLine}
                    pathOptions={{
                        color: '#aaa',
                        weight: 6,
                        opacity: 0.4,
                        dashArray: '6 5',
                    }}
                />
            )}

            {/* Alternative routes (pre-navigation) */}
            {directionsMode && activeAlts && !navigating &&
                activeAlts.map((alt, idx) => (
                    <Polyline
                        key={idx}
                        positions={alt.coords}
                        pathOptions={{
                            color:     alt.color,
                            weight:    idx === selectedAltIdx ? 6 : 3,
                            opacity:   idx === selectedAltIdx ? 0.9 : 0.4,
                            dashArray: idx === selectedAltIdx ? null : '8 6',
                            lineCap:   'round',
                            lineJoin:  'round',
                        }}
                        eventHandlers={{ click: () => setSelectedAltIdx(idx) }}
                    />
                ))
            }

            {/* Active navigation line */}
            {directionsMode && navigating && activeRoute && (
                <Polyline
                    positions={remainingLine ?? activeRoute.coords}
                    pathOptions={{
                        color:    activeRoute.color ?? '#4A90D9',
                        weight:   6,
                        opacity:  0.9,
                        lineCap:  'round',
                        lineJoin: 'round',
                    }}
                />
            )}
        </>
    );
}