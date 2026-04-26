import React from 'react';
import CategoryList from './CategoryList';

export default function Sidebar({
    isOpen,
    onClose,
    onOpenAddLocation,
    onLocateCategory,
    onNavigateToCategory,
}) {
    return (
        <>
            {isOpen && <div className="backdrop" onClick={onClose} />}

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>Menu</h2>

                <button className="sidebar-btn" onClick={onOpenAddLocation}>
                    + Add Location
                </button>

                <div className="sidebar-section-title">Categories</div>

                <CategoryList
                    onLocate={onLocateCategory}
                    onNavigate={onNavigateToCategory}
                />
            </div>
        </>
    );
}
