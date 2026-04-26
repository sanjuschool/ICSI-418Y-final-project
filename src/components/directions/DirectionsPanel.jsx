import React from 'react';

export default function DirectionsPanel({
                                            fromText, setFromText, fromCoords, setFromCoords,
                                            toText,
                                            fromSugg, toSugg,
                                            handleFromChange, handleToChange,
                                            selectFrom, selectTo,
                                            cancelDirections,
                                            userLocationRef,
                                            locations,
                                        }) {
    return (
        <div className="directions-panel">
            <div className="directions-fields">

                {/* ── From field ── */}
                <div className="dir-field-wrap">
                    <span className="dir-dot dir-dot-from">●</span>
                    <div className="dir-input-wrap">
                        <input
                            className="dir-input"
                            placeholder="From: My Location"
                            value={fromText}
                            onFocus={() => {
                                if (fromText === 'My Location') setFromText('');
                            }}
                            onChange={e => handleFromChange(e.target.value, locations)}
                            onBlur={() => {
                                if (!fromText) {
                                    setFromText('My Location');
                                    setFromCoords(userLocationRef.current);
                                }
                            }}
                        />
                        {fromSugg.length > 0 && (
                            <div className="dir-suggestions">
                                {fromSugg.map(loc => (
                                    <div
                                        key={loc._id}
                                        className="dir-suggestion-item"
                                        onMouseDown={() => selectFrom(loc)}
                                    >
                                        <strong>{loc.name}</strong>{' '}
                                        <span>{loc.category}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="dir-connector">│</div>

                {/* ── To field ── */}
                <div className="dir-field-wrap">
                    <span className="dir-dot dir-dot-to">●</span>
                    <div className="dir-input-wrap">
                        <input
                            className="dir-input"
                            placeholder="To: Choose destination"
                            value={toText}
                            onChange={e => handleToChange(e.target.value, locations)}
                        />
                        {toSugg.length > 0 && (
                            <div className="dir-suggestions">
                                {toSugg.map(loc => (
                                    <div
                                        key={loc._id}
                                        className="dir-suggestion-item"
                                        onMouseDown={() => selectTo(loc)}
                                    >
                                        <strong>{loc.name}</strong>{' '}
                                        <span>{loc.category}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button className="dir-close-btn" onClick={cancelDirections}>✕</button>
        </div>
    );
}