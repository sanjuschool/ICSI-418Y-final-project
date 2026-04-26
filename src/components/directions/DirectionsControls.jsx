import React from 'react';
import { MODES, formatDist, formatTime } from '../../utils/mapHelpers';

export default function DirectionsControls({
                                               routeLoading,
                                               routeData,
                                               travelMode, setTravelMode,
                                               activeAlts, activeRoute,
                                               selectedAltIdx, setSelectedAltIdx,
                                               navigating,
                                               totalDistKm, totalDurationS,
                                               remainingKm, remainingDurS,
                                               startNavigation, endNavigation,
                                               toCoords,
                                           }) {
    if (!toCoords || (!routeLoading && !activeRoute)) return null;

    return (
        <div className="directions-bottom">
            {routeLoading ? (
                <div className="route-loading">Calculating routes…</div>
            ) : (
                <>
                    {/* ── Travel mode tabs ── */}
                    <div className="travel-modes">
                        {MODES.map(m => {
                            const fastest = routeData[m.id]?.[0];
                            return (
                                <button
                                    key={m.id}
                                    className={`travel-mode-btn ${travelMode === m.id ? 'active' : ''}`}
                                    onClick={() => setTravelMode(m.id)}
                                >
                                    <span className="mode-icon">{m.icon}</span>
                                    <span className="mode-label">{m.label}</span>
                                    <span className="mode-time">
                                        {fastest ? formatTime(fastest.duration) : '…'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Alternative routes ── */}
                    {activeAlts && activeAlts.length > 1 && !navigating && (
                        <div className="alt-routes">
                            {activeAlts.map((alt, idx) => (
                                <button
                                    key={idx}
                                    className={`alt-route-btn ${selectedAltIdx === idx ? 'active' : ''}`}
                                    style={{ '--alt-color': alt.color }}
                                    onClick={() => setSelectedAltIdx(idx)}
                                >
                                    <span className="alt-route-dot" />
                                    <span className="alt-route-label">{alt.label}</span>
                                    <span className="alt-route-info">
                                        {formatDist(alt.distance)} · {formatTime(alt.duration)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Summary row ── */}
                    <div className="directions-summary">
                        {navigating ? (
                            <>
                                <span className="dist-label">Remaining</span>
                                <span className="dist-value">
                                    {remainingKm != null ? formatDist(remainingKm) : '—'}
                                </span>
                                {remainingDurS != null && (
                                    <span className="dist-total">· {formatTime(remainingDurS)}</span>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="dist-label">Distance</span>
                                <span className="dist-value">
                                    {totalDistKm != null ? formatDist(totalDistKm) : '—'}
                                </span>
                                {totalDurationS != null && (
                                    <span className="dist-total">· {formatTime(totalDurationS)}</span>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Action button ── */}
                    {!navigating ? (
                        <button
                            className="start-nav-btn"
                            onClick={startNavigation}
                            disabled={!activeRoute}
                        >
                            ▶ Start
                        </button>
                    ) : (
                        <button className="stop-nav-btn" onClick={endNavigation}>
                            ■ End Navigation
                        </button>
                    )}
                </>
            )}
        </div>
    );
}