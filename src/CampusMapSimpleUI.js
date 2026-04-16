import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';

export default function CampusMapSimpleUI() {
  const campusCenter = [42.6867, -73.8238];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Campus Map</h1>
            <p className="text-sm text-slate-600">Viewing main quad</p>
          </div>

          <button
            className="text-sm font-medium text-red-600"
            onClick={() => (window.location.href = '/')}
          >
            Logout
          </button>
        </header>

        {/* MAIN CONTENT */}
        <div className="relative">

          {/* TOP BAR (Menu + Search) */}
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="menu-btn"
            >
              ☰
            </button>

            <input
              type="text"
              placeholder="Search locations..."
              className="search-input"
            />
          </div>

          {/* MAP */}
          <main className="px-4 pb-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <MapContainer
                center={campusCenter}
                zoom={16}
                style={{ height: '70vh', width: '100%' }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </MapContainer>
            </div>
          </main>

          {/* SIDEBAR OVERLAY */}
          {isSidebarOpen && (
            <div
              className="backdrop"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* SIDEBAR */}
          <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <button
              className="close-btn"
              onClick={() => setIsSidebarOpen(false)}
            >
              ×
            </button>

            <h2 className="text-lg font-semibold mb-4">Menu</h2>

            <div className="space-y-3">
              <button className="sidebar-btn">
                Find My Location
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}