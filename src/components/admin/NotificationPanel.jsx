import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotificationPanel({
    onShowOnMap,
    onApproved,   // callback so parent can refresh locations list
}) {
    const [pendingLocations, setPendingLocations] = useState([]);
    const [showPanel, setShowPanel]               = useState(false);
    const [loading, setLoading]                   = useState(false);

    async function load() {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:9000/getPendingLocations');
            setPendingLocations(res.data);
        } catch (err) { console.log(err); }
        setLoading(false);
    }

    // Initial load
    useEffect(() => { load(); }, []);

    async function handleApprove(id) {
        try {
            await axios.patch(`http://localhost:9000/updateLocationStatus/${id}`, { status: 'approved' });
            setPendingLocations(prev => prev.filter(l => l._id !== id));
            onApproved?.();
        } catch { alert('Failed to approve'); }
    }

    async function handleDecline(id) {
        try {
            await axios.patch(`http://localhost:9000/updateLocationStatus/${id}`, { status: 'declined' });
            setPendingLocations(prev => prev.filter(l => l._id !== id));
        } catch { alert('Failed to decline'); }
    }

    return (
        <div className="notif-wrapper">
            {/* Bell button */}
            <button
                className="notif-btn"
                onClick={() => {
                    setShowPanel(p => !p);
                    if (!showPanel) load();
                }}
            >
                🔔
                {pendingLocations.length > 0 && (
                    <span className="notif-badge">{pendingLocations.length}</span>
                )}
            </button>

            {/* Dropdown panel */}
            {showPanel && (
                <div className="notif-panel">
                    <div className="notif-header">
                        <span>Pending Submissions</span>
                        <button className="notif-close" onClick={() => setShowPanel(false)}>
                            ✕
                        </button>
                    </div>

                    {loading ? (
                        <div className="notif-empty">Loading…</div>
                    ) : pendingLocations.length === 0 ? (
                        <div className="notif-empty">No pending submissions ✓</div>
                    ) : (
                        <div className="notif-list">
                            {pendingLocations.map(loc => (
                                <div key={loc._id} className="notif-item">
                                    <div className="notif-item-info">
                                        <strong className="notif-name">{loc.name}</strong>
                                        <div className="notif-meta-row">
                                            {loc.category && (
                                                <span className="notif-tag">{loc.category}</span>
                                            )}
                                            <span className="notif-by">by {loc.createdBy}</span>
                                        </div>
                                        {loc.description && (
                                            <p className="notif-desc">{loc.description}</p>
                                        )}
                                        <span className="notif-coords">
                                            {Number(loc.coordinates.lat).toFixed(5)},{' '}
                                            {Number(loc.coordinates.long).toFixed(5)}
                                        </span>
                                        <span className="notif-date">
                                            {new Date(loc.createdAt).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    <div className="notif-actions">
                                        <button
                                            className="notif-locate"
                                            title="Show on map"
                                            onClick={() => {
                                                onShowOnMap?.(loc);
                                                setShowPanel(false);
                                            }}
                                        >
                                            🗺 Show
                                        </button>
                                        <button
                                            className="notif-approve"
                                            onClick={() => handleApprove(loc._id)}
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            className="notif-decline"
                                            onClick={() => handleDecline(loc._id)}
                                        >
                                            ✕ Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
