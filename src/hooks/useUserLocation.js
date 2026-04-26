import { useState, useEffect, useRef } from 'react';

/**
 * Watches the user's GPS position.
 *
 * Returns:
 *   userLocation    – [lat, lng] | null  (React state, triggers re-renders)
 *   userLocationRef – mutable ref, always current (safe to read in callbacks)
 *   locatingLabel   – true until first fix received
 *
 * onPositionUpdate({ loc, isFirst }) is called on every GPS tick.
 * We store it in a ref so the watchPosition closure always calls the
 * latest version without needing to restart the watcher.
 */
export default function useUserLocation({ onPositionUpdate } = {}) {
    const [userLocation, setUserLocation] = useState(null);
    const [locatingLabel, setLocatingLabel] = useState(true);

    const userLocationRef     = useRef(null);
    const hasFlownToUserRef   = useRef(false);
    const onPositionUpdateRef = useRef(onPositionUpdate); // always-current ref

    // Keep the callback ref fresh on every render
    onPositionUpdateRef.current = onPositionUpdate;

    useEffect(() => {
        const watcher = navigator.geolocation.watchPosition(
            ({ coords: { latitude: lat, longitude: lng } }) => {
                const loc = [lat, lng];
                userLocationRef.current = loc;
                setUserLocation(loc);
                setLocatingLabel(false);

                const isFirst = !hasFlownToUserRef.current;
                if (isFirst) hasFlownToUserRef.current = true;

                // Call via ref — never stale, no need to restart the watcher
                onPositionUpdateRef.current?.({ loc, isFirst });
            },
            err => {
                console.log('GPS error:', err);
                setLocatingLabel(false);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );

        return () => navigator.geolocation.clearWatch(watcher);
    }, []); // empty — watcher started once; callback freshness handled by ref above

    return { userLocation, userLocationRef, locatingLabel };
}