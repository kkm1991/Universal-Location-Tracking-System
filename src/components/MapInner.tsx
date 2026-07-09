"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icon assets
const defaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface TrackableMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed?: number;
  battery_level?: number;
  entity_type?: "person" | "vehicle" | "asset";
  updated_at?: string;
}

interface MapInnerProps {
  markers: TrackableMarker[];
  center?: [number, number];
  zoom?: number;
}

// Custom icons based on entity types using SVG in divIcon
const getCustomIcon = (type?: "person" | "vehicle" | "asset", isMoving = false) => {
  let color = "#6366f1"; // Indigo default
  let iconSvg = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;

  if (type === "person") {
    color = "#10b981"; // Emerald
    iconSvg = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    `;
  } else if (type === "vehicle") {
    color = "#3b82f6"; // Blue
    iconSvg = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    `;
  } else if (type === "asset") {
    color = "#f59e0b"; // Amber
    iconSvg = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    `;
  }

  const pulseClass = isMoving ? "animate-ping" : "";

  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <div class="absolute inset-0 rounded-full opacity-20 ${pulseClass}" style="background-color: ${color}"></div>
        <div class="relative w-8 h-8 rounded-full border-2 border-white/20 shadow-lg flex items-center justify-center text-white" style="background-color: ${color}">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

function FlyToPosition({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position[0], position[1], map]);
  return null;
}

export default function MapInner({ markers, center = [16.8661, 96.1951], zoom = 13 }: MapInnerProps) {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  // Fly map to first marker if coordinates change
  const activeCenter: [number, number] = markers.length > 0 ? [markers[0].lat, markers[0].lng] : center;

  useEffect(() => {
    // Update marker coordinates dynamically on location change without full re-render
    markers.forEach((marker) => {
      const leafletMarker = markerRefs.current.get(marker.id);
      if (leafletMarker) {
        leafletMarker.setLatLng([marker.lat, marker.lng]);
        leafletMarker.setIcon(getCustomIcon(marker.entity_type, (marker.speed || 0) > 2));
      }
    });
  }, [markers]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, iPC, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          keepBuffer={20}
        />
        
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={getCustomIcon(marker.entity_type, (marker.speed || 0) > 2)}
            ref={(ref) => {
              if (ref) {
                markerRefs.current.set(marker.id, ref);
              } else {
                markerRefs.current.delete(marker.id);
              }
            }}
          >
            <Popup minWidth={200}>
              <div className="p-1">
                <h4 className="font-semibold text-white text-base border-b border-white/10 pb-1 mb-2 flex items-center justify-between">
                  <span>{marker.name}</span>
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full capitalize bg-white/5 text-[#94a3b8]">
                    {marker.entity_type || "asset"}
                  </span>
                </h4>
                <div className="space-y-1.5 text-xs text-[#94a3b8]">
                  <p className="flex justify-between">
                    <span>Speed:</span>
                    <span className="text-white font-medium">
                      {marker.speed !== undefined && marker.speed !== null
                        ? `${Number(marker.speed).toFixed(1)} km/h`
                        : "0.0 km/h"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Battery:</span>
                    <span className="text-white font-medium">
                      {marker.battery_level !== undefined && marker.battery_level !== null
                        ? `${marker.battery_level}%`
                        : "N/A"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Last Updated:</span>
                    <span className="text-white font-medium">
                      {marker.updated_at
                        ? new Date(marker.updated_at).toLocaleTimeString()
                        : "Now"}
                    </span>
                  </p>
                  <p className="text-[10px] text-center border-t border-white/5 pt-1.5 mt-2">
                    ID: {marker.id.substring(0, 8)}...
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {markers.length > 0 && <FlyToPosition position={activeCenter} />}
      </MapContainer>
    </div>
  );
}
