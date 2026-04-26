import React from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import MapController from './MapController';
import MapMarkers    from './MapMarkers';
import MapRoutes     from './MapRoutes';
import { DEFAULT_CENTER } from '../../utils/mapHelpers';

export default function MapView({
                                    // map signals
                                    flyTarget, flyTrigger, fitBoundsPoints, fitTrigger,
                                    // markers
                                    userLocation, navigating,
                                    directionsMode, selectedLocation, categoryHighlight,
                                    highlightedPending, isAdmin,
                                    fromCoords, fromText, toCoords, toText,
                                    // routes
                                    activeAlts, activeRoute, selectedAltIdx, setSelectedAltIdx,
                                    remainingLine, completedLine,
                                }) {
    return (
        <MapContainer
            center={DEFAULT_CENTER}
            zoom={17}
            className="full-map"
            zoomControl={false}
        >
            <MapController
                flyTarget={flyTarget}
                flyTrigger={flyTrigger}
                fitBoundsPoints={fitBoundsPoints}
                fitTrigger={fitTrigger}
            />

            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ZoomControl position="bottomright" />

            <MapMarkers
                userLocation={userLocation}
                navigating={navigating}
                directionsMode={directionsMode}
                selectedLocation={selectedLocation}
                categoryHighlight={categoryHighlight}
                highlightedPending={highlightedPending}
                isAdmin={isAdmin}
                fromCoords={fromCoords}
                fromText={fromText}
                toCoords={toCoords}
                toText={toText}
            />

            <MapRoutes
                directionsMode={directionsMode}
                navigating={navigating}
                activeAlts={activeAlts}
                activeRoute={activeRoute}
                selectedAltIdx={selectedAltIdx}
                setSelectedAltIdx={setSelectedAltIdx}
                remainingLine={remainingLine}
                completedLine={completedLine}
            />
        </MapContainer>
    );
}