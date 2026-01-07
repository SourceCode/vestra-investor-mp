
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '../types';
import { Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet's default icon path issues using CDN
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  /** List of properties to display as markers. */
  properties: Property[];
  /** ID of the currently selected property to highlight. */
  selectedId?: string | null;
  /** Callback fired when a marker is clicked. */
  onSelect?: (id: string) => void;
  /** Initial center coordinates. */
  center?: { lat: number; lng: number };
  /** Zoom level. */
  zoom?: number;
}

/**
 * Controller component to handle programmatic map movements.
 * This component must be a child of MapContainer to access the map instance via useMap.
 */
const MapController: React.FC<{ center?: { lat: number; lng: number }; zoom?: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo([center.lat, center.lng], zoom || 13, { duration: 1.5 });
        }
        // Force resize recalculation to ensure tiles load correctly
        map.invalidateSize();
    }, [center, zoom, map]);
    return null;
}

/**
 * Creates a custom HTML div icon for property markers.
 */
const createCustomIcon = (price: number, isSelected: boolean) => {
    const kPrice = Math.round(price / 1000) + 'k';
    return L.divIcon({
        className: 'custom-marker-wrapper',
        html: `<div class="custom-marker-pin ${isSelected ? 'selected' : ''}">$${kPrice}</div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 15]
    });
};

/**
 * Renders an interactive map with property markers.
 * Uses React Leaflet and OpenStreetMap tiles.
 */
const MapView: React.FC<MapViewProps> = ({ properties, selectedId, onSelect, center, zoom = 12 }) => {
  const navigate = useNavigate();
  const defaultCenter = { lat: 34.0522, lng: -118.2437 }; // LA Center
  const mapCenter = center || (properties.length > 0 ? properties[0].location : defaultCenter);

  return (
    <div className="h-full w-full relative bg-slate-100 isolate">
      <MapContainer 
        center={[mapCenter.lat, mapCenter.lng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} zoom={zoom} />

        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.location.lat, property.location.lng]}
            icon={createCustomIcon(property.price, property.id === selectedId)}
            eventHandlers={{
              click: () => onSelect && onSelect(property.id),
              mouseover: (e) => e.target.openPopup(),
              mouseout: (e) => e.target.closePopup(),
            }}
          >
             <Popup closeButton={false} className="custom-popup" offset={[0, -10]}>
                 <div 
                   className="w-48 cursor-pointer"
                   onClick={() => navigate(`/property/${property.id}`)}
                 >
                     <img src={property.image} alt="" className="w-full h-24 object-cover rounded-t-lg block" />
                     <div className="p-3 bg-white rounded-b-lg">
                         <Typography variant="subtitle2" className="font-bold text-slate-900">${property.price.toLocaleString()}</Typography>
                         <Typography variant="caption" className="text-slate-500 line-clamp-1">{property.address}</Typography>
                         <div className="flex items-center justify-between mt-2">
                             <span className="text-emerald-600 text-xs font-bold">{property.metrics.projectedRoi}% ROI</span>
                             <ArrowForward fontSize="inherit" className="text-slate-400" />
                         </div>
                     </div>
                 </div>
             </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
