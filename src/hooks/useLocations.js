import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Loads the approved locations list once on mount.
 * Exposes `reload` so other parts of the app can refresh after an approval.
 */
export default function useLocations() {
    const [locations, setLocations] = useState([]);

    async function reload() {
        try {
            const res = await axios.get('http://localhost:9000/getLocations');
            setLocations(res.data);
        } catch (err) {
            console.log('useLocations error:', err);
        }
    }

    useEffect(() => { reload(); }, []);

    return { locations, reload };
}