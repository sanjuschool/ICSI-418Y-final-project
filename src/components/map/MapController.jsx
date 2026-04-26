import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function MapController({
                                          flyTarget, flyTrigger, flyZoom,
                                          fitBoundsPoints, fitTrigger,
                                          // nav tracking — re-centers on user every GPS tick without animation
                                          navCenter, navTrigger,
                                      }) {
    const map     = useMap();
    const prevFly = useRef(-1);
    const prevFit = useRef(-1);
    const prevNav = useRef(-1);

    // Animated fly (search result, first GPS fix, start nav)
    useEffect(() => {
        if (flyTrigger !== prevFly.current && flyTarget) {
            prevFly.current = flyTrigger;
            map.flyTo(flyTarget, flyZoom ?? 17, { duration: 1.4 });
        }
    }, [flyTrigger]);

    // Fit full route bounds (pre-nav route overview)
    useEffect(() => {
        if (fitTrigger !== prevFit.current && fitBoundsPoints?.length >= 2) {
            prevFit.current = fitTrigger;
            map.fitBounds(L.latLngBounds(fitBoundsPoints), { padding: [80, 80], maxZoom: 17 });
        }
    }, [fitTrigger]);

    // Nav tracking — smooth pan to user on every GPS tick (no zoom change)
    useEffect(() => {
        if (navTrigger !== prevNav.current && navCenter) {
            prevNav.current = navTrigger;
            map.panTo(navCenter, { animate: true, duration: 0.5 });
        }
    }, [navTrigger]);

    return null;
}