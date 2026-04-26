import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import {
    userIcon, navUserIcon,
    redPinIcon, orangePinIcon, destIcon,
} from '../../utils/mapHelpers';

export default function MapMarkers({
                                       userLocation,
                                       navigating,
                                       directionsMode,
                                       selectedLocation,
                                       categoryHighlight,
                                       highlightedPending,
                                       isAdmin,
                                       fromCoords,
                                       fromText,
                                       toCoords,
                                       toText,
                                   }) {
    return (
        <>
            {/* User dot */}
            {userLocation && (
                <Marker position={userLocation} icon={navigating ? navUserIcon : userIcon}>
                    <Popup>You are here</Popup>
                </Marker>
            )}

            {/* Search-selected location — red pin */}
            {!directionsMode && selectedLocation && (
                <Marker
                    position={[
                        Number(selectedLocation.coordinates.lat),
                        Number(selectedLocation.coordinates.long),
                    ]}
                    icon={redPinIcon}
                >
                    <Popup>
                        <strong>{selectedLocation.name}</strong>
                        <br />
                        {selectedLocation.category}
                    </Popup>
                </Marker>
            )}

            {/* Category-browsed location — orange pin */}
            {categoryHighlight && !directionsMode && (
                <Marker
                    position={[
                        Number(categoryHighlight.coordinates.lat),
                        Number(categoryHighlight.coordinates.long),
                    ]}
                    icon={orangePinIcon}
                >
                    <Popup>
                        <strong>{categoryHighlight.name}</strong>
                        <br />
                        {categoryHighlight.category}
                    </Popup>
                </Marker>
            )}

            {/* Admin: highlighted pending — orange pin */}
            {isAdmin && highlightedPending && (
                <Marker
                    position={[
                        Number(highlightedPending.coordinates.lat),
                        Number(highlightedPending.coordinates.long),
                    ]}
                    icon={orangePinIcon}
                >
                    <Popup>
                        <strong>{highlightedPending.name}</strong>
                        <br />
                        By: {highlightedPending.createdBy}
                        <br />
                        <em>Pending review</em>
                    </Popup>
                </Marker>
            )}

            {/* Directions: from marker (only when not "My Location") */}
            {directionsMode && fromCoords && fromText !== 'My Location' && (
                <Marker position={fromCoords}>
                    <Popup>From: {fromText}</Popup>
                </Marker>
            )}

            {/* Directions: destination pin */}
            {directionsMode && toCoords && (
                <Marker position={toCoords} icon={destIcon}>
                    <Popup>To: {toText}</Popup>
                </Marker>
            )}

            {/* Arrival radius ring */}
            {navigating && toCoords && (
                <Circle
                    center={toCoords}
                    radius={15}
                    pathOptions={{
                        color: '#E74C3C',
                        fillColor: '#E74C3C',
                        fillOpacity: 0.2,
                        weight: 2,
                    }}
                />
            )}
        </>
    );
}