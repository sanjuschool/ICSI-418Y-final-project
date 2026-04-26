import L from 'leaflet';

// ─── Icons ────────────────────────────────────────────────────────────────────
export const userIcon = new L.DivIcon({
    className: '',
    html: `<div style="width:20px;height:20px;border-radius:50%;background:#4A90D9;border:3px solid #fff;box-shadow:0 0 0 3px rgba(74,144,217,0.4);"></div>`,
    iconSize: [20, 20], iconAnchor: [10, 10],
});

export const navUserIcon = new L.DivIcon({
    className: '',
    html: `<div class="nav-pulse-dot"></div>`,
    iconSize: [26, 26], iconAnchor: [13, 13],
});

function makePinIcon(color) {
    return new L.DivIcon({
        className: '',
        html: `<div style="position:relative;width:28px;height:38px;">
            <div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.35);"></div>
            <div style="position:absolute;top:7px;left:7px;width:10px;height:10px;border-radius:50%;background:#fff;opacity:0.85;"></div>
        </div>`,
        iconSize: [28, 38], iconAnchor: [14, 38], popupAnchor: [0, -40],
    });
}

export const redPinIcon    = makePinIcon('#E74C3C');
export const orangePinIcon = makePinIcon('#F39C12');
export const destIcon      = makePinIcon('#E74C3C');

// ─── Distance / time formatters ───────────────────────────────────────────────
export function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDist(km) {
    const miles = km * 0.621371;
    if (miles < 0.1) return `${Math.round(km * 3280.84)} ft`;
    return `${miles.toFixed(2)} mi`;
}

export function formatTime(seconds) {
    const mins = Math.round(seconds / 60);
    if (mins < 1) return '< 1 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function closestPointIndex(polyline, latlng) {
    let best = 0, bestDist = Infinity;
    polyline.forEach(([lat, lng], i) => {
        const d = haversineKm(latlng[0], latlng[1], lat, lng);
        if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
}

// ─── OSRM routing ─────────────────────────────────────────────────────────────
const OSRM_BASES = {
    walk: 'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
    bike: 'https://routing.openstreetmap.de/routed-bike/route/v1/bike',
    car:  'https://routing.openstreetmap.de/routed-car/route/v1/driving',
};

export const ALT_COLORS = ['#4A90D9', '#27AE60', '#F39C12'];

export async function fetchOSRMRoute(fromCoords, toCoords, mode) {
    const base = OSRM_BASES[mode];
    const url  = `${base}/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson&alternatives=true`;
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

export async function fetchAllRoutes(fromCoords, toCoords) {
    const results = {};
    for (const mode of ['walk', 'bike', 'car']) {
        try { results[mode] = await fetchOSRMRoute(fromCoords, toCoords, mode); }
        catch { results[mode] = null; }
        await new Promise(r => setTimeout(r, 150));
    }
    return results;
}

// ─── App constants ────────────────────────────────────────────────────────────
export const MODES = [
    { id: 'walk', label: 'Walk',  icon: '🚶' },
    { id: 'bike', label: 'Bike',  icon: '🚲' },
    { id: 'car',  label: 'Drive', icon: '🚗' },
];

export const CATEGORIES = [
    'Academic Buildings',
    'Restaurants',
    'Parks',
    'Parking',
    'Offices',
];

export const DEFAULT_CENTER = [42.6867, -73.8238];