import React from 'react';

export default function CategoryItem({ loc, onLocate, onNavigate }) {
    return (
        <div className="category-item">
            <span className="category-item-name">{loc.name}</span>
            <div className="category-item-actions">
                <button
                    className="cat-action-btn cat-locate"
                    title="Show on map"
                    onClick={() => onLocate(loc)}
                >
                    📍
                </button>
                <button
                    className="cat-action-btn cat-nav"
                    title="Navigate here"
                    onClick={() => onNavigate(loc)}
                >
                    ▶
                </button>
            </div>
        </div>
    );
}