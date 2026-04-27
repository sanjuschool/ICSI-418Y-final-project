import React from 'react';
import { BiSearch } from 'react-icons/bi';
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

            {/* Icon + input grouped together */}
            <div className="search-input-wrap">
                <BiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search locations..."
                    className="search-input"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />

                {/* Dropdown anchors to this wrap */}
                {searchText && filteredLocations.length > 0 && (
                    <SearchSuggestions
                        results={filteredLocations}
                        onSelect={onSelectLocation}
                    />
                )}
            </div>

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

        </div>
    );
}