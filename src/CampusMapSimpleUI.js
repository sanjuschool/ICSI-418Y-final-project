import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BiDirections, BiMenu, BiSearch, BiSolidStar, BiLocationPlus, BiBuildingHouse, BiRestaurant, BiCar, BiBriefcase, BiX } from "react-icons/bi";
import './CampusMapUIStyles.css';

export default function CampusMapSimpleUI() {
  const campusCenter = [42.6867, -73.8238];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="campus-page">
      <div className="content-layout">
        <main className="map-section">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="menu-btn"
            aria-label="Open menu"
          >
            <BiMenu />
          </button>

          <div className="search-bar">
            <BiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search locations..."
            />
          </div>

          <div className="map-card">
            <MapContainer
              center={campusCenter}
              zoom={16}
              className="campus-map"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </MapContainer>
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="backdrop"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>UA Maps</h2>
          <button
            className="close-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <BiX />
          </button>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">Categories</p>

          <button className="sidebar-item">
            <BiBuildingHouse />
            <span>Academic Buildings</span>
          </button>

          <button className="sidebar-item">
            <BiRestaurant />
            <span>Restaurants</span>
          </button>

          <button className="sidebar-item">
            <BiCar />
            <span>Parking Lots</span>
          </button>

          <button className="sidebar-item">
            <BiBriefcase />
            <span>Offices</span>
          </button>

          <p className="sidebar-label">Actions</p>

          <button className="sidebar-item">
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

          <button className="logout-btn" onClick={() => window.location.href = '/'}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}