import React from 'react';

export default function SearchSuggestions({ results, onSelect }) {
    return (
        <div className="search-suggestions">
            {results.map(loc => (
                <div
                    key={loc._id}
                    className="search-suggestion-item"
                    onClick={() => onSelect(loc)}
                >
                    <strong>{loc.name}</strong>
                    <span>{loc.category}</span>
                </div>
            ))}
        </div>
    );
}
