import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function CampusMapSimpleUI() {
  const campusCenter = [42.6867, -73.8238];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white shadow-xl overflow-hidden border border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Campus Map</h1>
            <p className="text-sm text-slate-600">Viewing main quad</p>
          </div>
          <button className="text-sm text-red-600 font-medium" onClick={() => window.location.href='/'}>
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
          <aside className="border-r border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-800">Controls</h2>
            <div className="mt-4 space-y-3">
               <button className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white">
                Find My Location
              </button>
            </div>
          </aside>

          <main className="p-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <MapContainer
                center={campusCenter}
                zoom={16}
                style={{ height: '70vh', width: '100%' }}
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