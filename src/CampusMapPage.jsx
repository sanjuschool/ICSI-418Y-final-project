import React, { useState, useRef, useCallback } from 'react';

// ── Hooks ─────────────────────────────────────────────────────────────────────
import useUserLocation from './hooks/useUserLocation';
import useLocations    from './hooks/useLocations';
import useRouting      from './hooks/useRouting';

// ── Map ───────────────────────────────────────────────────────────────────────
import MapView from './components/map/MapView';

// ── Directions ────────────────────────────────────────────────────────────────
import DirectionsPanel    from './components/directions/DirectionsPanel';
import DirectionsControls from './components/directions/DirectionsControls';

// ── Search ────────────────────────────────────────────────────────────────────
import SearchBar from './components/search/SearchBar';

// ── Sidebar ───────────────────────────────────────────────────────────────────
import Sidebar from './components/sidebar/Sidebar';

// ── Admin ─────────────────────────────────────────────────────────────────────
import NotificationPanel from './components/admin/NotificationPanel';

// ── Modals ────────────────────────────────────────────────────────────────────
import AddLocationModal from './components/modals/AddLocationModal';

// ── Styles ────────────────────────────────────────────────────────────────────
import './styles.css';

// ─────────────────────────────────────────────────────────────────────────────
export default function CampusMapPage() {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const storedUser = localStorage.getItem('user');
    const user       = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin    = user?.role === 'admin';

    // ── Map signals (flyTo / fitBounds) passed down into MapView ─────────────
    const [flyTarget, setFlyTarget]             = useState(null);
    const [flyTrigger, setFlyTrigger]           = useState(0);
    const [fitBoundsPoints, setFitBoundsPoints] = useState(null);
    const [fitTrigger, setFitTrigger]           = useState(0);

    function triggerFly(coords) {
        setFlyTarget(coords);
        setFlyTrigger(t => t + 1);
    }
    function triggerFitBounds(coords) {
        setFitBoundsPoints(coords);
        setFitTrigger(t => t + 1);
    }

    // ── Travel mode (lifted so DirectionsControls + useRouting share it) ──────
    const [travelMode, setTravelMode] = useState('walk');

    // ── Shared stable ref — created ONCE, passed to BOTH hooks ───────────────
    // Fix: useRouting receives the same ref object that useUserLocation writes
    // to on every GPS tick, so startNavigation() always reads the real position.
    const userLocRefBridge = useRef(null);

    // ── Routing hook ──────────────────────────────────────────────────────────
    const routing = useRouting({
        travelMode,
        userLocationRef: userLocRefBridge,   // ← shared ref, always current
        onFitBounds: triggerFitBounds,
        onFlyTo:     triggerFly,
    });

    // ── GPS hook — writes into the shared ref on every tick ──────────────────
    const { userLocation, userLocationRef, locatingLabel } = useUserLocation({
        onPositionUpdate: ({ loc, isFirst }) => {
            userLocRefBridge.current = loc;   // keep shared ref current
            if (isFirst) triggerFly(loc);
            routing.onPositionUpdate({ loc });
        },
    });

    // ── Approved locations ────────────────────────────────────────────────────
    const { locations, reload: reloadLocations } = useLocations();

    // ── UI state ──────────────────────────────────────────────────────────────
    const [isSidebarOpen, setIsSidebarOpen]       = useState(false);
    const [directionsMode, setDirectionsMode]     = useState(false);
    const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

    // ── Search state ──────────────────────────────────────────────────────────
    const [searchText, setSearchText]             = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchText.toLowerCase()) ||
        loc.category?.toLowerCase().includes(searchText.toLowerCase())
    );

    // ── Category / sidebar highlight ─────────────────────────────────────────
    const [categoryHighlight, setCategoryHighlight] = useState(null);

    // ── Admin: pending highlight on map ───────────────────────────────────────
    const [highlightedPending, setHighlightedPending] = useState(null);

    // ── Search handlers ───────────────────────────────────────────────────────
    function handleSelectSearchResult(loc) {
        setSelectedLocation(loc);
        setSearchText(loc.name);
        setCategoryHighlight(null);
        triggerFly([Number(loc.coordinates.lat), Number(loc.coordinates.long)]);
    }

    function handleLocateMe() {
        if (!userLocationRef.current) { alert('Location not found yet.'); return; }
        setSelectedLocation(null);
        setSearchText('');
        triggerFly(userLocationRef.current);
    }

    function handleStartDirections() {
        routing.setFromCoords(userLocationRef.current);
        routing.setFromText('My Location');
        setDirectionsMode(true);
    }

    function handleCancelDirections() {
        routing.cancelDirections();
        setDirectionsMode(false);
    }

    // ── Sidebar / category handlers ───────────────────────────────────────────
    function handleLocateCategory(loc) {
        setCategoryHighlight(loc);
        setSelectedLocation(null);
        triggerFly([Number(loc.coordinates.lat), Number(loc.coordinates.long)]);
        setIsSidebarOpen(false);
    }

    function handleNavigateToCategory(loc) {
        setIsSidebarOpen(false);
        routing.initDirections(loc, userLocationRef.current);
        setDirectionsMode(true);
    }

    function handleOpenAddLocation() {
        setIsSidebarOpen(false);
        setIsAddLocationOpen(true);
    }

    // ── Admin: show pending pin on map ────────────────────────────────────────
    function handleShowPendingOnMap(loc) {
        setHighlightedPending(loc);
        triggerFly([Number(loc.coordinates.lat), Number(loc.coordinates.long)]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="map-page">
            {/* Keyframe animations shared across components */}
            <style>{`
                .nav-pulse-dot {
                    width:26px;height:26px;border-radius:50%;background:#4A90D9;
                    border:3px solid #fff;animation:navPulse 1.5s ease-in-out infinite;
                }
                @keyframes navPulse {
                    0%,100%{ box-shadow:0 0 0 5px rgba(74,144,217,0.35),0 0 20px rgba(74,144,217,0.6); }
                    50%    { box-shadow:0 0 0 10px rgba(74,144,217,0.08),0 0 30px rgba(74,144,217,0.85); }
                }
                @keyframes slideUp   { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn    { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
                .directions-panel  { animation:slideDown 0.25s ease; }
                .directions-bottom { animation:slideUp 0.3s ease; }
                .notif-panel       { animation:fadeIn 0.2s ease; }
            `}</style>

            {/* ── Map canvas ── */}
            <MapView
                flyTarget={flyTarget} flyTrigger={flyTrigger}
                fitBoundsPoints={fitBoundsPoints} fitTrigger={fitTrigger}
                userLocation={userLocation}
                navigating={routing.navigating}
                directionsMode={directionsMode}
                selectedLocation={selectedLocation}
                categoryHighlight={categoryHighlight}
                highlightedPending={highlightedPending}
                isAdmin={isAdmin}
                fromCoords={routing.fromCoords}
                fromText={routing.fromText}
                toCoords={routing.toCoords}
                toText={routing.toText}
                activeAlts={routing.activeAlts}
                activeRoute={routing.activeRoute}
                selectedAltIdx={routing.selectedAltIdx}
                setSelectedAltIdx={routing.setSelectedAltIdx}
                remainingLine={routing.remainingLine}
                completedLine={routing.completedLine}
            />

            {locatingLabel && (
                <div className="location-loading">Finding your location…</div>
            )}

            {/* ── Top controls bar ── */}
            <div className="map-controls">
                <button onClick={() => setIsSidebarOpen(true)} className="menu-btn">☰</button>

                {!directionsMode ? (
                    <SearchBar
                        searchText={searchText}
                        setSearchText={setSearchText}
                        filteredLocations={filteredLocations}
                        onSelectLocation={handleSelectSearchResult}
                        onStartDirections={handleStartDirections}
                        onLocateMe={handleLocateMe}
                    />
                ) : (
                    <DirectionsPanel
                        fromText={routing.fromText}
                        setFromText={routing.setFromText}
                        fromCoords={routing.fromCoords}
                        setFromCoords={routing.setFromCoords}
                        toText={routing.toText}
                        fromSugg={routing.fromSugg}
                        toSugg={routing.toSugg}
                        handleFromChange={routing.handleFromChange}
                        handleToChange={routing.handleToChange}
                        selectFrom={routing.selectFrom}
                        selectTo={routing.selectTo}
                        cancelDirections={handleCancelDirections}
                        userLocationRef={userLocRefBridge}
                        locations={locations}
                    />
                )}
            </div>

            {/* ── Bottom sheet (directions) ── */}
            {directionsMode && (
                <DirectionsControls
                    routeLoading={routing.routeLoading}
                    routeData={routing.routeData}
                    travelMode={travelMode}
                    setTravelMode={setTravelMode}
                    activeAlts={routing.activeAlts}
                    activeRoute={routing.activeRoute}
                    selectedAltIdx={routing.selectedAltIdx}
                    setSelectedAltIdx={routing.setSelectedAltIdx}
                    navigating={routing.navigating}
                    totalDistKm={routing.totalDistKm}
                    totalDurationS={routing.totalDurationS}
                    remainingKm={routing.remainingKm}
                    remainingDurS={routing.remainingDurS}
                    startNavigation={() => routing.startNavigation(userLocRefBridge)}
                    endNavigation={routing.endNavigation}
                    toCoords={routing.toCoords}
                />
            )}

            {/* ── Admin notification bell ── */}
            {isAdmin && (
                <NotificationPanel
                    onShowOnMap={handleShowPendingOnMap}
                    onApproved={reloadLocations}
                />
            )}

            {/* ── Logout ── */}
            <button
                className="logout-btn"
                onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}
            >
                Logout
            </button>

            {/* ── Sidebar ── */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onOpenAddLocation={handleOpenAddLocation}
                onLocateCategory={handleLocateCategory}
                onNavigateToCategory={handleNavigateToCategory}
            />

            {/* ── Add Location modal ── */}
            {isAddLocationOpen && (
                <AddLocationModal
                    isAdmin={isAdmin}
                    userLocation={userLocation}
                    userLocationRef={userLocRefBridge}
                    user={user}
                    onClose={() => setIsAddLocationOpen(false)}
                    onSubmitted={reloadLocations}
                />
            )}
        </div>
    );
}