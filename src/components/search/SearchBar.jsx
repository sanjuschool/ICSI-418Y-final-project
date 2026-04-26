import React from 'react';
import SearchSuggestions from './SearchSuggestions';

export default function SearchBar({
    searchText, setSearchText,
    filteredLocations,
    onSelectLocation,
    onStartDirections,
    onLocateMe,
}) {
    return (
        <div className="search-wrapper">
            <input
                type="text"
                placeholder="Search locations..."
                className="search-input"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
            />

            <button
                className="directions-toggle-btn"
                title="Get directions"
                onClick={onStartDirections}
            >
                ▶
            </button>

            <button className="location-btn" onClick={onLocateMe}>
                📍
            </button>

            {searchText && filteredLocations.length > 0 && (
                <SearchSuggestions
                    results={filteredLocations}
                    onSelect={onSelectLocation}
                />
            )}
        </div>
    );
}
