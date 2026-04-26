import { useState, useEffect, useRef } from 'react';
import { haversineKm, closestPointIndex, fetchAllRoutes } from '../utils/mapHelpers';

/**
 * Owns all directions + navigation state.
 *
 * Consumers receive:
 *   – route data per mode
 *   – active route / alt selection
 *   – remaining line for live navigation
 *   – handlers: startNavigation, endNavigation, cancelDirections
 */
export default function useRouting({ travelMode, userLocationRef, onFitBounds, onFlyTo, onNavCenter }) {
    const [fromText, setFromText]     = useState('My Location');
    const [fromCoords, setFromCoords] = useState(null);
    const [toText, setToText]         = useState('');
    const [toCoords, setToCoords]     = useState(null);
    const [fromSugg, setFromSugg]     = useState([]);
    const [toSugg, setToSugg]         = useState([]);

    const [routeData, setRouteData]           = useState({ walk: null, bike: null, car: null });
    const [routeLoading, setRouteLoading]     = useState(false);
    const [selectedAltIdx, setSelectedAltIdx] = useState(0);

    const [navigating, setNavigating]       = useState(false);
    const [remainingLine, setRemainingLine] = useState(null);
    const navigatingRef                     = useRef(false);

    // Keep ref in sync so GPS callback can read it synchronously
    useEffect(() => { navigatingRef.current = navigating; }, [navigating]);

    // Reset alt index when mode changes
    useEffect(() => { setSelectedAltIdx(0); }, [travelMode]);

    // Fetch routes whenever endpoints change
    useEffect(() => {
        if (!fromCoords || !toCoords) return;
        setRouteLoading(true);
        setRouteData({ walk: null, bike: null, car: null });
        setSelectedAltIdx(0);
        setNavigating(false);
        setRemainingLine(null);

        fetchAllRoutes(fromCoords, toCoords).then(newData => {
            setRouteData(newData);
            setRouteLoading(false);
            const fit =
                newData[travelMode]?.[0]?.coords ??
                Object.values(newData).find(d => d)?.[0]?.coords;
            if (fit) onFitBounds?.(fit);
        });
    }, [fromCoords, toCoords]);

    // Fit bounds when active route changes
    useEffect(() => {
        const active = routeData[travelMode]?.[selectedAltIdx] ?? routeData[travelMode]?.[0];
        if (active?.coords?.length >= 2) onFitBounds?.(active.coords);
    }, [travelMode, selectedAltIdx, routeData]);

    // Called by useUserLocation on every GPS tick
    function onPositionUpdate({ loc }) {
        if (!navigatingRef.current) return;
        // Trim the remaining route line as user advances
        setRemainingLine(prev => {
            if (!prev || prev.length < 2) return prev;
            const idx = closestPointIndex(prev, loc);
            return idx > 0 ? prev.slice(idx) : prev;
        });
        // Pan map to keep user centered during navigation
        onNavCenter?.(loc);
    }

    // ── Suggestion helpers ────────────────────────────────────────────────────
    function handleFromChange(val, locations) {
        setFromText(val);
        setFromSugg(val ? locations.filter(l => l.name.toLowerCase().includes(val.toLowerCase())) : []);
    }
    function handleToChange(val, locations) {
        setToText(val);
        setToSugg(val ? locations.filter(l => l.name.toLowerCase().includes(val.toLowerCase())) : []);
    }
    function selectFrom(loc) {
        setFromText(loc.name);
        setFromCoords([Number(loc.coordinates.lat), Number(loc.coordinates.long)]);
        setFromSugg([]);
    }
    function selectTo(loc) {
        setToText(loc.name);
        setToCoords([Number(loc.coordinates.lat), Number(loc.coordinates.long)]);
        setToSugg([]);
    }

    // ── Navigation actions ────────────────────────────────────────────────────
    function startNavigation() {
        const active = routeData[travelMode]?.[selectedAltIdx] ?? routeData[travelMode]?.[0];
        if (!active) return;
        setRemainingLine([...active.coords]);
        setNavigating(true);
        // Fly to user's current position at street level (zoom 16) so the
        // journey feels like it's starting from where they stand — Google Maps style.
        // zoom 16 shows ~4 blocks ahead which is ideal for on-foot / bike / car.
        if (userLocationRef.current) onFlyTo?.(userLocationRef.current, 16);
    }
    function endNavigation() {
        setNavigating(false);
        const active = routeData[travelMode]?.[selectedAltIdx] ?? routeData[travelMode]?.[0];
        if (active) setRemainingLine([...active.coords]);
    }
    function cancelDirections() {
        setFromText('My Location');
        setFromCoords(userLocationRef.current);
        setToText('');
        setToCoords(null);
        setFromSugg([]);
        setToSugg([]);
        setRouteData({ walk: null, bike: null, car: null });
        setRemainingLine(null);
        setNavigating(false);
        setSelectedAltIdx(0);
    }
    function initDirections(dest, userLoc) {
        setToText(dest.name);
        setToCoords([Number(dest.coordinates.lat), Number(dest.coordinates.long)]);
        setFromCoords(userLoc);
        setFromText('My Location');
    }

    // ── Derived ───────────────────────────────────────────────────────────────
    const activeAlts     = routeData[travelMode];
    const activeRoute    = activeAlts?.[selectedAltIdx] ?? activeAlts?.[0] ?? null;
    const totalDistKm    = activeRoute?.distance ?? null;
    const totalDurationS = activeRoute?.duration ?? null;

    const remainingKm = (navigating && remainingLine?.length >= 2)
        ? (() => {
            let d = 0;
            for (let i = 1; i < remainingLine.length; i++)
                d += haversineKm(remainingLine[i-1][0], remainingLine[i-1][1], remainingLine[i][0], remainingLine[i][1]);
            return d;
        })()
        : totalDistKm;

    const remainingDurS = (navigating && totalDistKm && remainingKm != null && totalDurationS)
        ? totalDurationS * (remainingKm / totalDistKm)
        : totalDurationS;

    const completedLine = (navigating && activeRoute && remainingLine)
        ? (() => {
            const full = activeRoute.coords;
            const idx  = closestPointIndex(full, remainingLine[0] ?? full[0]);
            return idx > 0 ? full.slice(0, idx + 1) : null;
        })()
        : null;

    return {
        // field state
        fromText, setFromText, fromCoords, setFromCoords,
        toText,   setToText,   toCoords,   setToCoords,
        fromSugg, toSugg,
        handleFromChange, handleToChange, selectFrom, selectTo,
        // route state
        routeData, routeLoading, selectedAltIdx, setSelectedAltIdx,
        activeAlts, activeRoute,
        // navigation state
        navigating, remainingLine,
        totalDistKm, totalDurationS, remainingKm, remainingDurS,
        completedLine,
        // actions
        startNavigation, endNavigation, cancelDirections, initDirections,
        onPositionUpdate,
    };
}