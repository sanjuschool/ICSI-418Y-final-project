import React from 'react';
import CategoryList from './CategoryList';
import {
    BiDirections,
    BiSolidStar,
    BiLocationPlus,
    BiBuildingHouse,
    BiRestaurant,
    BiCar,
    BiBriefcase,
    BiX,
    BiLandscape
} from "react-icons/bi";

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
                <div className="sidebar-header">
                    <h2>UA Maps</h2>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <BiX />
                    </button>
                </div>

                <div className="sidebar-section">
                    <p className="sidebar-label">Categories</p>

                    <CategoryList
                        onLocate={onLocateCategory}
                        onNavigate={onNavigateToCategory}
                        icons={{
                            "Academic Buildings": <BiBuildingHouse />,
                            "Restaurants": <BiRestaurant />,
                            "Parking Lots": <BiCar />,
                            "Parking": <BiCar />,
                            "Offices": <BiBriefcase />,
                            "Parks": <BiLandscape />,
                            "Park": <BiLandscape />
                        }}
                    />

                    <p className="sidebar-label">Actions</p>

                    <button className="sidebar-item" onClick={onOpenAddLocation}>
                        <BiLocationPlus />
                        <span>Add Location</span>
                    </button>

                    <button className="sidebar-item">
                        <BiSolidStar />
                        <span>Favorites</span>
                    </button>

                    <button className="sidebar-item">
                        <BiDirections />
                        <span>Directions</span>
                    </button>

                    <button
                        className="logout-btn"
                        onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}
                    >
                        Logout
                    </button>

                </div>
            </div>
        </>
    );
}