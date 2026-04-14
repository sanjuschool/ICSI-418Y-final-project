import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function CampusMapSimpleUI() {
  // Replace these with your campus center coordinates later
  const campusCenter = [42.6867, -73.8238];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white shadow-xl overflow-hidden border border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Campus Map</h1>
          <p className="mt-1 text-sm text-slate-600">
            Basic map UI using React Leaflet + OpenStreetMap
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
          <aside className="border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-800">Controls</h2>
            <div className="mt-4 space-y-3">
              <button className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow">
                Load Campus Map
              </button>
              <button className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                Add Locations Later
              </button>
              <button className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                Connect MongoDB Later
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-4 border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">Current Setup</h3>
              <p className="mt-2 text-sm text-slate-600">
                This is just the base UI so you can load and view the full map first.
              </p>
            </div>
          </aside>

          <main className="p-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <MapContainer
                center={campusCenter}
                zoom={16}
                scrollWheelZoom={true}
                style={{ height: '75vh', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
              </MapContainer>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
