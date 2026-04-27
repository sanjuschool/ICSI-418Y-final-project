import React, { useState } from 'react';
import axios from 'axios';
import CategoryItem from './CategoryItem';
import { CATEGORIES } from '../../utils/mapHelpers';

export default function CategoryList({ onLocate, onNavigate, icons = {} }) {
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [categoryLocations, setCategoryLocations] = useState({});
    const [categoryLoading, setCategoryLoading] = useState({});

    async function toggleCategory(cat) {
        if (expandedCategory === cat) {
            setExpandedCategory(null);
            return;
        }

        setExpandedCategory(cat);

        if (categoryLocations[cat] !== undefined) return;

        setCategoryLoading(prev => ({ ...prev, [cat]: true }));

        try {
            const res = await axios.get(
                `http://localhost:9000/getLocationsByCategory?category=${encodeURIComponent(cat)}`
            );

            setCategoryLocations(prev => ({ ...prev, [cat]: res.data }));
        } catch {
            setCategoryLocations(prev => ({ ...prev, [cat]: [] }));
        }

        setCategoryLoading(prev => ({ ...prev, [cat]: false }));
    }

    return (
        <div className="category-list">
            {CATEGORIES.map(cat => (
                <div key={cat} className="category-group">
                    <button
                        className={`sidebar-item category-header-btn ${expandedCategory === cat ? 'expanded' : ''}`}
                        onClick={() => toggleCategory(cat)}
                    >
                        {icons[cat]}
                        <span className="category-header-name">{cat}</span>
                        <span className="category-chevron">
                            {expandedCategory === cat ? '▲' : '▼'}
                        </span>
                    </button>

                    {expandedCategory === cat && (
                        <div className="category-items">
                            {categoryLoading[cat] ? (
                                <div className="category-loading">Loading…</div>
                            ) : (categoryLocations[cat] ?? []).length === 0 ? (
                                <div className="category-loading">No locations found</div>
                            ) : (
                                (categoryLocations[cat] ?? []).map(loc => (
                                    <CategoryItem
                                        key={loc._id}
                                        loc={loc}
                                        onLocate={onLocate}
                                        onNavigate={onNavigate}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}