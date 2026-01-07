
import { Bathtub, Bed, Favorite, FavoriteBorder, Lock, Public, SquareFoot } from '@mui/icons-material';
import { Card, CardContent, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { useToast } from '../contexts/ToastContext';
import { RootState, toggleSaveRequest } from '../store';
import { Property } from '../types';

interface PropertyCardProps {
  /** Whether to show a compact version of the card (e.g., for similar listings). */
  compact?: boolean;
  /** The property object to display. */
  property: Property;
}

// Optimization: Memoize the component to prevent re-renders when list updates but specific item data hasn't changed
/**
 * Displays a summary card for a property listing.
 * Includes quick actions like 'Save' and navigation to details.
 * Memoized to optimize rendering in large lists.
 */
const PropertyCard: React.FC<PropertyCardProps> = memo(({ compact = false, property }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  // Optimization: Select specific fields instead of whole state to reduce re-render triggers
  const isSaved = useSelector((state: RootState) => state.saved.savedIds.includes(property.id));
  const isLocked = useSelector((state: RootState) => !state.auth.isAuthenticated || state.investor.profile.status === 'LOCKED');
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleSave = (e: React.MouseEvent) => {
    // Stop propagation not needed if z-index managed correctly, but good for safety if layout changes
    e.preventDefault(); 
    e.stopPropagation();
    if (!isAuthenticated) {
        showToast('Please sign in to save properties', 'info');
        return;
    }
    dispatch(toggleSaveRequest(property.id));
    showToast(isSaved ? 'Removed from saved' : 'Added to saved deals');
  };

  return (
    <Card 
      component="article"
      className="h-full flex flex-col hover:shadow-xl transition-all duration-300 group border-slate-200 relative bg-white"
      elevation={0}
    >
      <div className="relative overflow-hidden aspect-[4/3] sm:aspect-[16/9]">
        {/* Main interactive area is the link wrapping the image */}
        <Link 
            to={`/property/${property.id}`} 
            className="block w-full h-full focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-slate-900"
            aria-label={`View details for ${property.address}, ${property.city}`}
        >
            <img
              src={property.image}
              alt={`Property at ${property.address}`}
              loading="lazy"
              className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ${isLocked ? 'blur-[2px]' : ''}`}
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />
        </Link>
        
        {/* Save Button - Positioned absolutely with higher z-index */}
        <div className="absolute top-3 right-3 z-20">
          <IconButton 
            size="small" 
            className="bg-white/90 hover:bg-white text-slate-900 shadow-sm transition-transform hover:scale-110"
            onClick={handleSave}
            aria-label={isSaved ? `Remove ${property.address} from saved` : `Save ${property.address}`}
            aria-pressed={isSaved}
          >
            {isSaved ? <Favorite fontSize="small" className="text-rose-500" /> : <FavoriteBorder fontSize="small" />}
          </IconButton>
        </div>
        
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none z-10">
           <Chip 
            label={property.status.replace('_', ' ')} 
            size="small" 
            color={property.status === 'PUBLISHED' ? 'secondary' : 'default'}
            className="font-medium shadow-sm backdrop-blur-md"
          />
          {property.isNetworkDeal && (
              <Tooltip title={`Provided by ${property.originatingOrgName || 'Partner Network'}`}>
                  <Chip 
                    icon={<Public fontSize="small" className="text-indigo-200" />}
                    label="Network" 
                    size="small" 
                    className="font-medium shadow-sm backdrop-blur-md bg-indigo-600 text-white border-none"
                  />
              </Tooltip>
          )}
        </div>
        
        <div className="absolute bottom-3 left-3 text-white pointer-events-none z-10">
          <Typography variant="h6" component="p" className="font-bold leading-tight drop-shadow-md">
            ${property.price.toLocaleString()}
          </Typography>
        </div>

        {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 border border-white/20">
                    <Lock fontSize="small" className="text-white text-xs" />
                    <span className="text-white text-xs font-semibold">Address Locked</span>
                </div>
            </div>
        )}
      </div>
      
      <CardContent className="flex-grow flex flex-col p-4">
        <div className="mb-3">
          <Link 
            to={`/property/${property.id}`} 
            className="no-underline text-slate-900 hover:text-teal-700 focus:outline-none focus:underline decoration-2 underline-offset-2"
          >
              <Typography variant="subtitle1" component="h2" className="font-semibold leading-snug">
                {isLocked ? 'Unlisted Address' : property.address}
              </Typography>
          </Link>
          <Typography variant="body2" className="text-slate-600">
            {property.city}, {property.state} {property.zip}
          </Typography>
        </div>

        <div className="flex items-center gap-4 text-slate-700 mb-4 text-sm" aria-label="Property stats">
          <div className="flex items-center gap-1">
            <Bed fontSize="small" className="text-slate-500" aria-hidden="true" />
            <span>{property.beds} <span className="sr-only">Bedrooms</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Bathtub fontSize="small" className="text-slate-500" aria-hidden="true" />
            <span>{property.baths} <span className="sr-only">Bathrooms</span></span>
          </div>
          <div className="flex items-center gap-1">
            <SquareFoot fontSize="small" className="text-slate-500" aria-hidden="true" />
            <span>{property.sqft.toLocaleString()} <span className="sr-only">Square Feet</span></span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Proj. ROI</span>
                <span className="text-emerald-700 font-bold">{property.metrics.projectedRoi}%</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Est. ARV</span>
                <span className="text-slate-800 font-semibold">${(property.metrics.arv / 1000).toFixed(0)}k</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default PropertyCard;
