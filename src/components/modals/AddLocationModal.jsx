import React, { useState } from 'react';
import axios from 'axios';
import { CATEGORIES } from '../../utils/mapHelpers';

export default function AddLocationModal({
                                             isAdmin,
                                             userLocation,
                                             userLocationRef,
                                             user,
                                             onClose,
                                             onSubmitted,   // optional callback after successful submit
                                         }) {
    const [locationName, setLocationName] = useState('');
    const [category, setCategory]         = useState('');
    const [description, setDescription]   = useState('');
    const [latitude, setLatitude]         = useState(
        isAdmin && userLocationRef.current ? userLocationRef.current[0] : ''
    );
    const [longitude, setLongitude] = useState(
        isAdmin && userLocationRef.current ? userLocationRef.current[1] : ''
    );

    async function handleSubmit(e) {
        e.preventDefault();
        if (!user) { alert('Please log in again.'); return; }

        const loc = userLocationRef.current;
        if (!loc) { alert('Current location not found yet.'); return; }

        const finalLat  = isAdmin ? Number(latitude)  : loc[0];
        const finalLong = isAdmin ? Number(longitude) : loc[1];
        if (isNaN(finalLat) || isNaN(finalLong)) { alert('Invalid coordinates.'); return; }

        try {
            await axios.post('http://localhost:9000/createLocation', {
                name: locationName,
                category,
                description,
                createdBy: user.username,
                coordinates: { lat: finalLat, long: finalLong },
            });
            alert(isAdmin ? 'Location added!' : 'Location submitted for admin review!');
            onSubmitted?.();
            onClose();
        } catch (err) {
            alert(err.response?.data || 'Error submitting.');
        }
    }

    return (
        <div className="modal-backdrop">
            <form className="add-location-modal" onSubmit={handleSubmit}>
                <h2>Add Location</h2>

                <input
                    type="text"
                    placeholder="Location name"
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    required
                />

                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    required
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px' }}
                >
                    <option value="">Select category…</option>
                    {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />

                {isAdmin ? (
                    <>
                        <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>
                            Admin: you may edit coordinates manually.
                        </p>
                        <input
                            type="number" step="any" placeholder="Latitude"
                            value={latitude} onChange={e => setLatitude(e.target.value)} required
                        />
                        <input
                            type="number" step="any" placeholder="Longitude"
                            value={longitude} onChange={e => setLongitude(e.target.value)} required
                        />
                    </>
                ) : (
                    <>
                        <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>
                            Your current location will be submitted for admin review.
                        </p>
                        {userLocation && (
                            <p style={{ fontSize: '12px', color: '#999', margin: '0' }}>
                                {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                            </p>
                        )}
                    </>
                )}

                <button type="submit">
                    {isAdmin ? 'Add Location' : 'Submit for Review'}
                </button>
                <button type="button" onClick={onClose}>Cancel</button>
            </form>
        </div>
    );
}