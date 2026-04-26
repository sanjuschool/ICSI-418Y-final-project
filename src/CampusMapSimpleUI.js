import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    MapContainer,
    TileLayer,
    ZoomControl,
    Marker,
    Popup,
    useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';

export default function CampusMapSimpleUI() {
    const [locations, setLocations] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);

    const [goToUser, setGoToUser] = useState(false);

    const filteredLocations = locations.filter((loc) =>
        loc.name.toLowerCase().includes(searchText.toLowerCase()) ||
        loc.category?.toLowerCase().includes(searchText.toLowerCase())
    );
    const defaultCenter = [42.6867, -73.8238];
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin = user?.role === "admin";

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(true);

    const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
    const [locationName, setLocationName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    useEffect(() => {
        axios.get('http://localhost:9000/getLocations')
            .then((res) => setLocations(res.data))
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        const watcher = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const long = position.coords.longitude;

                setUserLocation([lat, long]);
                setIsLocating(false);
            },
            (error) => {
                console.log("Location error:", error);
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            }
        );

        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    function FlyToUserLocation({ userLocation, trigger }) {
        const map = useMap();

        useEffect(() => {
            if (userLocation && trigger) {
                map.flyTo(userLocation, 18);
            }
        }, [trigger, userLocation, map]);

        return null;
    }

    function FlyToSelectedLocation({ selectedLocation }) {
        const map = useMap();

        useEffect(() => {
            if (selectedLocation) {
                map.flyTo(
                    [
                        Number(selectedLocation.coordinates.lat),
                        Number(selectedLocation.coordinates.long)
                    ],
                    18
                );
            }
        }, [selectedLocation, map]);

        return null;
    }

    const handleAddLocation = async (event) => {
        event.preventDefault();

        if (!user) {
            alert("Please log in again.");
            return;
        }

        if (!userLocation) {
            alert("Current location not found yet.");
            return;
        }

        const finalLat = isAdmin ? Number(latitude) : userLocation[0];
        const finalLong = isAdmin ? Number(longitude) : userLocation[1];

        if (Number.isNaN(finalLat) || Number.isNaN(finalLong)) {
            alert("Please enter valid latitude and longitude.");
            return;
        }

        try {
            await axios.post('http://localhost:9000/createLocation', {
                name: locationName,
                category: category,
                description: description,
                createdBy: user.username,
                coordinates: {
                    lat: finalLat,
                    long: finalLong
                }
            });

            alert("Location submitted successfully!");

            setLocationName('');
            setCategory('');
            setDescription('');
            setIsAddLocationOpen(false);

        } catch (error) {
            console.log(error);
            alert(error.response?.data || "Error submitting location.");
        }
    };

    return (
        <div className="map-page">

            <MapContainer
                key={userLocation ? userLocation.toString() : 'default'}
                center={userLocation || defaultCenter}
                zoom={17}
                className="full-map"
                zoomControl={false}
            >
                <FlyToUserLocation userLocation={userLocation} trigger={goToUser} />
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ZoomControl position="bottomright" />

                {userLocation && (
                    <Marker position={userLocation}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}
                {selectedLocation && (
                    <Marker
                        position={[
                            selectedLocation.coordinates.lat,
                            selectedLocation.coordinates.long
                        ]}
                    >
                        <Popup>
                            {selectedLocation.name}
                        </Popup>
                    </Marker>
                )}
                <FlyToSelectedLocation selectedLocation={selectedLocation} />

            </MapContainer>

            {isLocating && (
                <div className="location-loading">
                    Finding your location...
                </div>
            )}


            <div className="map-controls">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="menu-btn"
                >
                    ☰
                </button>

                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search locations..."
                        className="search-input"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <button
                        className="location-btn"
                        onClick={() => {
                            setGoToUser(prev => !prev); // trigger re-run
                        }}
                    >📍
                    </button>


                    {searchText && filteredLocations.length > 0 && (
                        <div className="search-suggestions">
                            {filteredLocations.map((location) => (
                                <div
                                    key={location._id}
                                    className="search-suggestion-item"
                                    onClick={() => {
                                        setSelectedLocation(location);
                                        setSearchText(location.name);
                                    }}
                                >
                                    <strong>{location.name}</strong>
                                    <br />
                                    <span>{location.category}</span>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>

            <button
                className="logout-btn"
                onClick={() => {
                    localStorage.removeItem("user");
                    window.location.href = '/';
                }}
            >
                Logout
            </button>

            {isSidebarOpen && (
                <div
                    className="backdrop"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button
                    className="close-btn"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    ×
                </button>

                <h2>Menu</h2>

                <button
                    className="sidebar-btn"
                    onClick={() => {
                        setIsSidebarOpen(false);

                        if (userLocation) {
                            setLatitude(userLocation[0]);
                            setLongitude(userLocation[1]);
                        }

                        setIsAddLocationOpen(true);
                    }}
                >
                    Add Location
                </button>
            </div>

            {isAddLocationOpen && (
                <div className="modal-backdrop">
                    <form className="add-location-modal" onSubmit={handleAddLocation}>
                        <h2>Add Location</h2>

                        <input
                            type="text"
                            placeholder="Location name"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />

                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        {isAdmin ? (
                            <>
                                <p>
                                    Admin mode: you can manually edit the coordinates.
                                </p>

                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Latitude"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    required
                                />

                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Longitude"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <p>
                                    Coordinates will use your current location.
                                </p>

                                {userLocation && (
                                    <p>
                                        Lat: {userLocation[0]} <br />
                                        Long: {userLocation[1]}
                                    </p>
                                )}
                            </>
                        )}

                        <button type="submit">
                            Submit Location
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAddLocationOpen(false)}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}