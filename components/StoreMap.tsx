import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Store, Coordinates } from '../types';

interface StoreMapProps {
  userLocation: Coordinates;
  stores: Store[];
}

const StoreMap: React.FC<StoreMapProps> = ({ userLocation, stores }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Handle Map Initialization and Updates
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map if not exists
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(
        [userLocation.lat, userLocation.lng],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    } else {
      // Update center if location changes
      mapRef.current.setView([userLocation.lat, userLocation.lng]);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add User Marker (Blue)
    const userIcon = L.divIcon({
      className: 'bg-blue-600 w-4 h-4 rounded-full border-2 border-white shadow-lg',
      iconSize: [16, 16],
    });
    
    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup("You are here");
    markersRef.current.push(userMarker);

    // Add Store Markers (Red)
    stores.forEach((store, index) => {
      // Validate coordinates (allow 0)
      if (store.lat != null && store.lng != null) {
         const storeIcon = L.divIcon({
            html: `<div class="bg-red-500 text-white font-bold text-xs flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-md">${index + 1}</div>`,
            className: 'custom-div-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
          });

        const marker = L.marker([store.lat, store.lng], { icon: storeIcon })
          .addTo(mapRef.current!)
          .bindPopup(`<b>${store.name}</b><br/>${store.items.join(', ')}`);
        
        markersRef.current.push(marker);
      }
    });
    
    // Fit bounds if we have stores
    if (stores.length > 0) {
        const group = L.featureGroup(markersRef.current);
        // Add a small delay to ensure map size is calculated before fitting bounds
        setTimeout(() => {
           if (mapRef.current) {
               mapRef.current.fitBounds(group.getBounds().pad(0.1));
           }
        }, 100);
    }

  }, [userLocation, stores]);

  // Handle Resize Events
  useEffect(() => {
    if (!containerRef.current || !mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
        mapRef.current?.invalidateSize();
    });
    
    resizeObserver.observe(containerRef.current);

    return () => {
        resizeObserver.disconnect();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default StoreMap;