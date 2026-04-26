import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    MapContainer, TileLayer, ZoomControl, Marker, Popup,
    useMap, Polyline, Circle
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';

// ─── Icons ────────────────────────────────────────────────────────────────────
const userIcon = new L.DivIcon({
    className: '',
    html: `<div style="width:20px;height:20px;border-radius:50%;background:#4A90D9;border:3px solid #fff;box-shadow:0 0 0 3px rgba(74,144,217,0.4);"></div>`,
    iconSize: [20, 20], iconAnchor: [10, 10]
});
const navUserIcon = new L.DivIcon({
    className: '',
    html: `<div class="nav-pulse-dot"></div>`,
    iconSize: [26, 26], iconAnchor: [13, 13]
});

// CORRECTION 2: Proper red teardrop pin icons
function makePinIcon(color) {
    return new L.DivIcon({
        className: '',
        html: `<div style="position:relative;width:28px;height:38px;">
            <div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.35);"></div>
            <div style="position:absolute;top:7px;left:7px;width:10px;height:10px;border-radius:50%;background:#fff;opacity:0.85;"></div>
        </div>`,
        iconSize: [28, 38], iconAnchor: [14, 38], popupAnchor: [0, -40]
    });
}
const redPinIcon    = makePinIcon('#E74C3C');
const orangePinIcon = makePinIcon('#F39C12');
const destIcon      = makePinIcon('#E74C3C');

// ─── Distance helpers — MILES & FEET ─────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// CORRECTION 1: Show miles / feet
function formatDist(km) {
    const miles = km * 0.621371;
    if (miles < 0.1) return `${Math.round(km * 3280.84)} ft`;
    return `${miles.toFixed(2)} mi`;
}

function formatTime(seconds) {
    const mins = Math.round(seconds / 60);
    if (mins < 1) return '< 1 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── OSRM routing ─────────────────────────────────────────────────────────────
const OSRM_BASES = {
    walk: 'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
    bike: 'https://routing.openstreetmap.de/routed-bike/route/v1/bike',
    car:  'https://routing.openstreetmap.de/routed-car/route/v1/driving',
};
const ALT_COLORS = ['#4A90D9', '#27AE60', '#F39C12'];

async function fetchOSRMRoute(fromCoords, toCoords, mode) {
    const base = OSRM_BASES[mode];
    const url = `${base}/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson&alternatives=true`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No route');
    return data.routes.map((route, idx) => ({
        coords:   route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        duration: route.duration,
        distance: route.distance / 1000,
        label:    idx === 0 ? 'Fastest' : idx === 1 ? 'Alternative 1' : 'Alternative 2',
        color:    ALT_COLORS[idx] ?? ALT_COLORS[0],
    }));
}

async function fetchAllRoutes(fromCoords, toCoords) {
    const results = {};
    for (const mode of ['walk', 'bike', 'car']) {
        try { results[mode] = await fetchOSRMRoute(fromCoords, toCoords, mode); }
        catch { results[mode] = null; }
        await new Promise(r => setTimeout(r, 150));
    }
    return results;
}

function closestPointIndex(polyline, latlng) {
    let best = 0, bestDist = Infinity;
    polyline.forEach(([lat, lng], i) => {
        const d = haversineKm(latlng[0], latlng[1], lat, lng);
        if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
}

// ─── MapController ────────────────────────────────────────────────────────────
function MapController({ flyTarget, flyTrigger, fitBoundsPoints, fitTrigger }) {
    const map = useMap();
    const prevFly = useRef(-1);
    const prevFit = useRef(-1);
    useEffect(() => {
        if (flyTrigger !== prevFly.current && flyTarget) {
            prevFly.current = flyTrigger;
            map.flyTo(flyTarget, 18, { duration: 1.2 });
        }
    }, [flyTrigger]);
    useEffect(() => {
        if (fitTrigger !== prevFit.current && fitBoundsPoints?.length >= 2) {
            prevFit.current = fitTrigger;
            map.fitBounds(L.latLngBounds(fitBoundsPoints), { padding: [80, 80], maxZoom: 17 });
        }
    }, [fitTrigger]);
    return null;
}

const MODES = [
    { id: 'walk', label: 'Walk', icon: '🚶' },
    { id: 'bike', label: 'Bike', icon: '🚲' },
    { id: 'car',  label: 'Drive', icon: '🚗' },
];

const CATEGORIES = ['Academic Buildings', 'Restaurants', 'Parks', 'Parking', 'Offices'];

// ═════════════════════════════════════════════════════════════════════════════
export default function CampusMapSimpleUI() {
    const [locations, setLocations]               = useState([]);
    const [searchText, setSearchText]             = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);

    const defaultCenter = [42.6867, -73.8238];
    const storedUser    = localStorage.getItem('user');
    const user          = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin       = user?.role === 'admin';

    const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
    const [userLocation, setUserLocation]     = useState(null);
    const [locatingLabel, setLocatingLabel]   = useState(true);
    const userLocationRef                     = useRef(null);
    const hasFlownToUserRef                   = useRef(false);

    // ── FEATURE 1: Admin pending notifications ────────────────────────────────
    const [pendingLocations, setPendingLocations]     = useState([]);
    const [showNotifPanel, setShowNotifPanel]         = useState(false);
    const [notifLoading, setNotifLoading]             = useState(false);
    const [highlightedPending, setHighlightedPending] = useState(null);

    async function loadPendingLocations() {
        setNotifLoading(true);
        try {
            const res = await axios.get('http://localhost:9000/getPendingLocations');
            setPendingLocations(res.data);
            console.log(res.data);
        } catch (err) { console.log(err); }
        setNotifLoading(false);
    }

    async function handleApprove(id) {
        try {
            await axios.patch(`http://localhost:9000/updateLocationStatus/${id}`, { status: 'approved' });
            setPendingLocations(prev => prev.filter(l => l._id !== id));
            if (highlightedPending?._id === id) setHighlightedPending(null);
            // Refresh approved locations list
            const res = await axios.get('http://localhost:9000/getLocations');
            setLocations(res.data);
        } catch { alert('Failed to approve'); }
    }

    async function handleDecline(id) {
        try {
            await axios.patch(`http://localhost:9000/updateLocationStatus/${id}`, { status: 'declined' });
            setPendingLocations(prev => prev.filter(l => l._id !== id));
            if (highlightedPending?._id === id) setHighlightedPending(null);
        } catch { alert('Failed to decline'); }
    }

    // ── FEATURE 2: Category sidebar ───────────────────────────────────────────
    const [expandedCategory, setExpandedCategory]   = useState(null);
    const [categoryLocations, setCategoryLocations] = useState({});
    const [categoryLoading, setCategoryLoading]     = useState({});
    const [categoryHighlight, setCategoryHighlight] = useState(null);

    async function toggleCategory(cat) {
        if (expandedCategory === cat) { setExpandedCategory(null); return; }
        setExpandedCategory(cat);
        if (categoryLocations[cat] !== undefined) return;
        setCategoryLoading(prev => ({ ...prev, [cat]: true }));
        try {
            const res = await axios.get(`http://localhost:9000/getLocationsByCategory?category=${encodeURIComponent(cat)}`);
            setCategoryLocations(prev => ({ ...prev, [cat]: res.data }));
        } catch { setCategoryLocations(prev => ({ ...prev, [cat]: [] })); }
        setCategoryLoading(prev => ({ ...prev, [cat]: false }));
    }

    function locateCategoryItem(loc) {
        setCategoryHighlight(loc);
        setSelectedLocation(null);
        setFlyTarget([Number(loc.coordinates.lat), Number(loc.coordinates.long)]);
        setFlyTrigger(t => t + 1);
        setIsSidebarOpen(false);
    }

    function startNavToCategory(loc) {
        setIsSidebarOpen(false);
        setToText(loc.name);
        setToCoords([Number(loc.coordinates.lat), Number(loc.coordinates.long)]);
        setFromCoords(userLocationRef.current);
        setFromText('My Location');
        setDirectionsMode(true);
    }

    // ── Add location ──────────────────────────────────────────────────────────
    const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
    const [locationName, setLocationName] = useState('');
    const [category, setCategory]         = useState('');
    const [description, setDescription]   = useState('');
    const [latitude, setLatitude]         = useState('');
    const [longitude, setLongitude]       = useState('');

    // ── Map signals ───────────────────────────────────────────────────────────
    const [flyTarget, setFlyTarget]             = useState(null);
    const [flyTrigger, setFlyTrigger]           = useState(0);
    const [fitBoundsPoints, setFitBoundsPoints] = useState(null);
    const [fitTrigger, setFitTrigger]           = useState(0);

    // ── Directions ────────────────────────────────────────────────────────────
    const [directionsMode, setDirectionsMode] = useState(false);
    const [fromText, setFromText]   = useState('My Location');
    const [fromCoords, setFromCoords] = useState(null);
    const [toText, setToText]       = useState('');
    const [toCoords, setToCoords]   = useState(null);
    const [fromSugg, setFromSugg]   = useState([]);
    const [toSugg, setToSugg]       = useState([]);

    const [travelMode, setTravelMode]         = useState('walk');
    const [routeData, setRouteData]           = useState({ walk: null, bike: null, car: null });
    const [routeLoading, setRouteLoading]     = useState(false);
    const [selectedAltIdx, setSelectedAltIdx] = useState(0);

    const [navigating, setNavigating]     = useState(false);
    const [remainingLine, setRemainingLine] = useState(null);
    const navigatingRef                   = useRef(false);

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchText.toLowerCase()) ||
        loc.category?.toLowerCase().includes(searchText.toLowerCase())
    );

    useEffect(() => {
        axios.get('http://localhost:9000/getLocations')
            .then(res => setLocations(res.data))
            .catch(err => console.log(err));
    }, []);

    useEffect(() => { if (isAdmin) loadPendingLocations(); }, []);

    useEffect(() => {
        const watcher = navigator.geolocation.watchPosition(
            ({ coords: { latitude: lat, longitude: lng } }) => {
                const loc = [lat, lng];
                userLocationRef.current = loc;
                setUserLocation(loc);
                setLocatingLabel(false);
                if (!hasFlownToUserRef.current) {
                    hasFlownToUserRef.current = true;
                    setFlyTarget(loc);
                    setFlyTrigger(t => t + 1);
                }
                if (navigatingRef.current) {
                    setRemainingLine(prev => {
                        if (!prev || prev.length < 2) return prev;
                        const idx = closestPointIndex(prev, loc);
                        return idx > 0 ? prev.slice(idx) : prev;
                    });
                }
            },
            err => { console.log('GPS error:', err); setLocatingLabel(false); },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    useEffect(() => { navigatingRef.current = navigating; }, [navigating]);

    useEffect(() => {
        if (directionsMode) { setFromCoords(userLocationRef.current); setFromText('My Location'); }
    }, [directionsMode]);

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
            const fit = newData[travelMode]?.[0]?.coords ?? Object.values(newData).find(d => d)?.[0]?.coords;
            if (fit) { setFitBoundsPoints(fit); setFitTrigger(t => t + 1); }
        });
    }, [fromCoords, toCoords]);

    useEffect(() => {
        const active = routeData[travelMode]?.[selectedAltIdx] ?? routeData[travelMode]?.[0];
        if (active?.coords?.length >= 2) { setFitBoundsPoints(active.coords); setFitTrigger(t => t + 1); }
    }, [travelMode, selectedAltIdx]);

    useEffect(() => { setSelectedAltIdx(0); }, [travelMode]);

    function handleFromChange(val) {
        setFromText(val);
        setFromSugg(val ? locations.filter(l => l.name.toLowerCase().includes(val.toLowerCase())) : []);
    }
    function handleToChange(val) {
        setToText(val);
        setToSugg(val ? locations.filter(l => l.name.toLowerCase().includes(val.toLowerCase())) : []);
    }
    function selectFrom(loc) { setFromText(loc.name); setFromCoords([Number(loc.coordinates.lat), Number(loc.coordinates.long)]); setFromSugg([]); }
    function selectTo(loc)   { setToText(loc.name);   setToCoords([Number(loc.coordinates.lat),   Number(loc.coordinates.long)]); setToSugg([]); }

    function startNavigation() {
        const active = routeData[travelMode]?.[selectedAltIdx] ?? routeData[travelMode]?.[0];
        if (!active) return;
        setRemainingLine([...active.coords]);
        setNavigating(true);
        if (userLocationRef.current) { setFlyTarget(userLocationRef.current); setFlyTrigger(t => t + 1); }
    }
    function endNavigation() {
        setNavigating(false);
        const active = routeData[travelMode]?.[selectedAltIdx] ?? routeData[travelMode]?.[0];
        if (active) setRemainingLine([...active.coords]);
    }
    function cancelDirections() {
        setDirectionsMode(false); setFromText('My Location'); setFromCoords(userLocationRef.current);
        setToText(''); setToCoords(null); setFromSugg([]); setToSugg([]);
        setRouteData({ walk: null, bike: null, car: null }); setRemainingLine(null);
        setNavigating(false); setSelectedAltIdx(0);
    }

    const activeAlts     = routeData[travelMode];
    const activeRoute    = activeAlts?.[selectedAltIdx] ?? activeAlts?.[0] ?? null;
    const totalDistKm    = activeRoute?.distance ?? null;
    const totalDurationS = activeRoute?.duration ?? null;

    const remainingKm = (navigating && remainingLine?.length >= 2)
        ? (() => { let d = 0; for (let i = 1; i < remainingLine.length; i++) d += haversineKm(remainingLine[i-1][0], remainingLine[i-1][1], remainingLine[i][0], remainingLine[i][1]); return d; })()
        : totalDistKm;

    const remainingDurS = (navigating && totalDistKm && remainingKm != null && totalDurationS)
        ? totalDurationS * (remainingKm / totalDistKm) : totalDurationS;

    const completedLine = (navigating && activeRoute && remainingLine) ? (() => {
        const full = activeRoute.coords;
        const idx  = closestPointIndex(full, remainingLine[0] ?? full[0]);
        return idx > 0 ? full.slice(0, idx + 1) : null;
    })() : null;

    const handleAddLocation = async (e) => {
        e.preventDefault();
        if (!user) { alert('Please log in again.'); return; }
        const loc = userLocationRef.current;
        if (!loc) { alert('Current location not found yet.'); return; }
        const finalLat  = isAdmin ? Number(latitude)  : loc[0];
        const finalLong = isAdmin ? Number(longitude) : loc[1];
        if (isNaN(finalLat) || isNaN(finalLong)) { alert('Invalid coordinates.'); return; }
        try {
            await axios.post('http://localhost:9000/createLocation', {
                name: locationName, category, description,
                createdBy: user.username,
                coordinates: { lat: finalLat, long: finalLong }
            });
            alert(isAdmin ? 'Location added!' : 'Location submitted for admin review!');
            setLocationName(''); setCategory(''); setDescription('');
            setIsAddLocationOpen(false);
            if (isAdmin) loadPendingLocations();
        } catch (err) { alert(err.response?.data || 'Error submitting.'); }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="map-page">
            <style>{`
                .nav-pulse-dot { width:26px;height:26px;border-radius:50%;background:#4A90D9;border:3px solid #fff;animation:navPulse 1.5s ease-in-out infinite; }
                @keyframes navPulse { 0%,100%{box-shadow:0 0 0 5px rgba(74,144,217,0.35),0 0 20px rgba(74,144,217,0.6);} 50%{box-shadow:0 0 0 10px rgba(74,144,217,0.08),0 0 30px rgba(74,144,217,0.85);} }
                @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
                .directions-panel { animation:slideDown 0.25s ease; }
                .directions-bottom { animation:slideUp 0.3s ease; }
                .notif-panel { animation:fadeIn 0.2s ease; }
            `}</style>

            <MapContainer center={defaultCenter} zoom={17} className="full-map" zoomControl={false}>
                <MapController flyTarget={flyTarget} flyTrigger={flyTrigger} fitBoundsPoints={fitBoundsPoints} fitTrigger={fitTrigger} />
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ZoomControl position="bottomright" />

                {userLocation && (
                    <Marker position={userLocation} icon={navigating ? navUserIcon : userIcon}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}

                {/* Search-selected location — red pin */}
                {!directionsMode && selectedLocation && (
                    <Marker position={[Number(selectedLocation.coordinates.lat), Number(selectedLocation.coordinates.long)]} icon={redPinIcon}>
                        <Popup><strong>{selectedLocation.name}</strong><br/>{selectedLocation.category}</Popup>
                    </Marker>
                )}

                {/* Category-browsed location — orange pin */}
                {categoryHighlight && !directionsMode && (
                    <Marker position={[Number(categoryHighlight.coordinates.lat), Number(categoryHighlight.coordinates.long)]} icon={orangePinIcon}>
                        <Popup><strong>{categoryHighlight.name}</strong><br/>{categoryHighlight.category}</Popup>
                    </Marker>
                )}

                {/* Admin: highlighted pending location — orange pin */}
                {isAdmin && highlightedPending && (
                    <Marker position={[Number(highlightedPending.coordinates.lat), Number(highlightedPending.coordinates.long)]} icon={orangePinIcon}>
                        <Popup><strong>{highlightedPending.name}</strong><br/>By: {highlightedPending.createdBy}<br/><em>Pending review</em></Popup>
                    </Marker>
                )}

                {directionsMode && fromCoords && fromText !== 'My Location' && (
                    <Marker position={fromCoords}><Popup>From: {fromText}</Popup></Marker>
                )}
                {directionsMode && toCoords && (
                    <Marker position={toCoords} icon={destIcon}><Popup>To: {toText}</Popup></Marker>
                )}

                {completedLine?.length >= 2 && (
                    <Polyline positions={completedLine} pathOptions={{ color: '#aaa', weight: 6, opacity: 0.4, dashArray: '6 5' }} />
                )}

                {directionsMode && activeAlts && !navigating && activeAlts.map((alt, idx) => (
                    <Polyline key={idx} positions={alt.coords}
                              pathOptions={{ color: alt.color, weight: idx === selectedAltIdx ? 6 : 3, opacity: idx === selectedAltIdx ? 0.9 : 0.4, dashArray: idx === selectedAltIdx ? null : '8 6', lineCap: 'round', lineJoin: 'round' }}
                              eventHandlers={{ click: () => setSelectedAltIdx(idx) }}
                    />
                ))}

                {directionsMode && navigating && activeRoute && (
                    <Polyline positions={remainingLine ?? activeRoute.coords}
                              pathOptions={{ color: activeRoute.color ?? '#4A90D9', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} />
                )}

                {navigating && toCoords && (
                    <Circle center={toCoords} radius={15} pathOptions={{ color: '#E74C3C', fillColor: '#E74C3C', fillOpacity: 0.2, weight: 2 }} />
                )}
            </MapContainer>

            {locatingLabel && <div className="location-loading">Finding your location…</div>}

            {/* ── Top controls ── */}
            <div className="map-controls">
                <button onClick={() => setIsSidebarOpen(true)} className="menu-btn">☰</button>

                {!directionsMode ? (
                    <div className="search-wrapper">
                        <input type="text" placeholder="Search locations..." className="search-input"
                               value={searchText} onChange={e => setSearchText(e.target.value)} />
                        <button className="directions-toggle-btn" title="Get directions" onClick={() => setDirectionsMode(true)}>▶</button>
                        <button className="location-btn" onClick={() => {
                            if (!userLocationRef.current) { alert('Location not found yet.'); return; }
                            setSelectedLocation(null); setSearchText('');
                            setFlyTarget(userLocationRef.current); setFlyTrigger(t => t + 1);
                        }}>📍</button>
                        {searchText && filteredLocations.length > 0 && (
                            <div className="search-suggestions">
                                {filteredLocations.map(loc => (
                                    <div key={loc._id} className="search-suggestion-item"
                                         onClick={() => {
                                             setSelectedLocation(loc); setSearchText(loc.name);
                                             setCategoryHighlight(null);
                                             setFlyTarget([Number(loc.coordinates.lat), Number(loc.coordinates.long)]);
                                             setFlyTrigger(t => t + 1);
                                         }}>
                                        <strong>{loc.name}</strong><span>{loc.category}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="directions-panel">
                        <div className="directions-fields">
                            <div className="dir-field-wrap">
                                <span className="dir-dot dir-dot-from">●</span>
                                <div className="dir-input-wrap">
                                    <input className="dir-input" placeholder="From: My Location" value={fromText}
                                           onFocus={() => { if (fromText === 'My Location') setFromText(''); }}
                                           onChange={e => handleFromChange(e.target.value)}
                                           onBlur={() => { if (!fromText) { setFromText('My Location'); setFromCoords(userLocationRef.current); setFromSugg([]); } }} />
                                    {fromSugg.length > 0 && (
                                        <div className="dir-suggestions">
                                            {fromSugg.map(loc => (
                                                <div key={loc._id} className="dir-suggestion-item" onMouseDown={() => selectFrom(loc)}>
                                                    <strong>{loc.name}</strong> <span>{loc.category}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="dir-connector">│</div>
                            <div className="dir-field-wrap">
                                <span className="dir-dot dir-dot-to">●</span>
                                <div className="dir-input-wrap">
                                    <input className="dir-input" placeholder="To: Choose destination" value={toText}
                                           onChange={e => handleToChange(e.target.value)} />
                                    {toSugg.length > 0 && (
                                        <div className="dir-suggestions">
                                            {toSugg.map(loc => (
                                                <div key={loc._id} className="dir-suggestion-item" onMouseDown={() => selectTo(loc)}>
                                                    <strong>{loc.name}</strong> <span>{loc.category}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button className="dir-close-btn" onClick={cancelDirections}>✕</button>
                    </div>
                )}
            </div>

            {/* ── Bottom sheet ── */}
            {directionsMode && (routeLoading || activeRoute) && toCoords && (
                <div className="directions-bottom">
                    {routeLoading ? (
                        <div className="route-loading">Calculating routes…</div>
                    ) : (
                        <>
                            <div className="travel-modes">
                                {MODES.map(m => {
                                    const fastest = routeData[m.id]?.[0];
                                    return (
                                        <button key={m.id} className={`travel-mode-btn ${travelMode === m.id ? 'active' : ''}`}
                                                onClick={() => setTravelMode(m.id)}>
                                            <span className="mode-icon">{m.icon}</span>
                                            <span className="mode-label">{m.label}</span>
                                            <span className="mode-time">{fastest ? formatTime(fastest.duration) : '…'}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {activeAlts && activeAlts.length > 1 && !navigating && (
                                <div className="alt-routes">
                                    {activeAlts.map((alt, idx) => (
                                        <button key={idx}
                                                className={`alt-route-btn ${selectedAltIdx === idx ? 'active' : ''}`}
                                                style={{ '--alt-color': alt.color }}
                                                onClick={() => setSelectedAltIdx(idx)}>
                                            <span className="alt-route-dot" />
                                            <span className="alt-route-label">{alt.label}</span>
                                            <span className="alt-route-info">{formatDist(alt.distance)} · {formatTime(alt.duration)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="directions-summary">
                                {navigating ? (
                                    <>
                                        <span className="dist-label">Remaining</span>
                                        <span className="dist-value">{remainingKm != null ? formatDist(remainingKm) : '—'}</span>
                                        {remainingDurS != null && <span className="dist-total">· {formatTime(remainingDurS)}</span>}
                                    </>
                                ) : (
                                    <>
                                        <span className="dist-label">Distance</span>
                                        <span className="dist-value">{totalDistKm != null ? formatDist(totalDistKm) : '—'}</span>
                                        {totalDurationS != null && <span className="dist-total">· {formatTime(totalDurationS)}</span>}
                                    </>
                                )}
                            </div>

                            {!navigating
                                ? <button className="start-nav-btn" onClick={startNavigation} disabled={!activeRoute}>▶ Start</button>
                                : <button className="stop-nav-btn" onClick={endNavigation}>■ End Navigation</button>
                            }
                        </>
                    )}
                </div>
            )}

            {/* ── FEATURE 1: Admin notification bell ── */}
            {isAdmin && (
                <div className="notif-wrapper">
                    <button className="notif-btn" onClick={() => {
                        setShowNotifPanel(p => !p);
                        if (!showNotifPanel) loadPendingLocations();
                    }}>
                        🔔
                        {pendingLocations.length > 0 && (
                            <span className="notif-badge">{pendingLocations.length}</span>
                        )}
                    </button>

                    {showNotifPanel && (
                        <div className="notif-panel">
                            <div className="notif-header">
                                <span>Pending Submissions</span>
                                <button className="notif-close" onClick={() => setShowNotifPanel(false)}>✕</button>
                            </div>
                            {notifLoading ? (
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
                                                    {loc.category && <span className="notif-tag">{loc.category}</span>}
                                                    <span className="notif-by">by {loc.createdBy}</span>
                                                </div>
                                                {loc.description && <p className="notif-desc">{loc.description}</p>}
                                                <span className="notif-coords">
                                                    {Number(loc.coordinates.lat).toFixed(5)}, {Number(loc.coordinates.long).toFixed(5)}
                                                </span>
                                                <span className="notif-date">
                                                    {new Date(loc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="notif-actions">
                                                <button className="notif-locate" title="Show on map" onClick={() => {
                                                    setHighlightedPending(loc);
                                                    setFlyTarget([Number(loc.coordinates.lat), Number(loc.coordinates.long)]);
                                                    setFlyTrigger(t => t + 1);
                                                    setShowNotifPanel(false);
                                                }}>🗺 Show</button>
                                                <button className="notif-approve" onClick={() => handleApprove(loc._id)}>✓ Approve</button>
                                                <button className="notif-decline" onClick={() => handleDecline(loc._id)}>✕ Decline</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Logout */}
            <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}>
                Logout
            </button>

            {/* Sidebar */}
            {isSidebarOpen && <div className="backdrop" onClick={() => setIsSidebarOpen(false)} />}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
                <h2>Menu</h2>

                <button className="sidebar-btn" onClick={() => {
                    setIsSidebarOpen(false);
                    const loc = userLocationRef.current;
                    if (loc) { setLatitude(loc[0]); setLongitude(loc[1]); }
                    setIsAddLocationOpen(true);
                }}>+ Add Location</button>

                {/* FEATURE 2: Category browser */}
                <div className="sidebar-section-title">Categories</div>
                <div className="category-list">
                    {CATEGORIES.map(cat => (
                        <div key={cat} className="category-group">
                            <button
                                className={`category-header-btn ${expandedCategory === cat ? 'expanded' : ''}`}
                                onClick={() => toggleCategory(cat)}
                            >
                                <span className="category-header-name">{cat}</span>
                                <span className="category-chevron">{expandedCategory === cat ? '▲' : '▼'}</span>
                            </button>

                            {expandedCategory === cat && (
                                <div className="category-items">
                                    {categoryLoading[cat] ? (
                                        <div className="category-loading">Loading…</div>
                                    ) : (categoryLocations[cat] ?? []).length === 0 ? (
                                        <div className="category-loading">No locations found</div>
                                    ) : (
                                        (categoryLocations[cat] ?? []).map(loc => (
                                            <div key={loc._id} className="category-item">
                                                <span className="category-item-name">{loc.name}</span>
                                                <div className="category-item-actions">
                                                    <button className="cat-action-btn cat-locate" title="Show on map"
                                                            onClick={() => locateCategoryItem(loc)}>📍</button>
                                                    <button className="cat-action-btn cat-nav" title="Navigate here"
                                                            onClick={() => startNavToCategory(loc)}>▶</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Add location modal */}
            {isAddLocationOpen && (
                <div className="modal-backdrop">
                    <form className="add-location-modal" onSubmit={handleAddLocation}>
                        <h2>Add Location</h2>
                        <input type="text" placeholder="Location name" value={locationName}
                               onChange={e => setLocationName(e.target.value)} required />
                        <select value={category} onChange={e => setCategory(e.target.value)} required
                                style={{ padding:'10px', border:'1px solid #ccc', borderRadius:'8px', fontSize:'14px' }}>
                            <option value="">Select category…</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <textarea placeholder="Description (optional)" value={description}
                                  onChange={e => setDescription(e.target.value)} />
                        {isAdmin ? (
                            <>
                                <p style={{fontSize:'13px',color:'#666',margin:'0'}}>Admin: you may edit coordinates manually.</p>
                                <input type="number" step="any" placeholder="Latitude" value={latitude}
                                       onChange={e => setLatitude(e.target.value)} required />
                                <input type="number" step="any" placeholder="Longitude" value={longitude}
                                       onChange={e => setLongitude(e.target.value)} required />
                            </>
                        ) : (
                            <>
                                <p style={{fontSize:'13px',color:'#666',margin:'0'}}>Your current location will be submitted for admin review.</p>
                                {userLocation && (
                                    <p style={{fontSize:'12px',color:'#999',margin:'0'}}>
                                        {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                                    </p>
                                )}
                            </>
                        )}
                        <button type="submit">{isAdmin ? 'Add Location' : 'Submit for Review'}</button>
                        <button type="button" onClick={() => setIsAddLocationOpen(false)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
}