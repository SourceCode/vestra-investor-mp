import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Drawer, Typography, Slider, FormControl, Select, MenuItem, 
  InputLabel, Checkbox, ListItemText, OutlinedInput, Button, Chip, Switch, FormControlLabel 
} from '@mui/material';
import { FilterList, Map as MapIcon, ViewList, Public } from '@mui/icons-material';
import { AppDispatch, RootState, fetchProperties, setFilters, selectProperty } from '../store';
import PropertyCard from '../components/PropertyCard';
import MapView from '../components/MapView';

// Filter Component
const FilterPanel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.search.filters);

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      dispatch(setFilters({ priceMin: newValue[0], priceMax: newValue[1] }));
    }
  };

  const handleNetworkToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setFilters({ includeNetworkDeals: event.target.checked }));
  };

  return (
    <div className="p-6 w-full md:w-80 flex flex-col gap-6 h-full overflow-y-auto border-r border-slate-200 bg-white">
      <div>
        <Typography variant="h6" className="font-bold mb-4">Filters</Typography>
        
        <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <FormControlLabel 
                control={<Switch checked={filters.includeNetworkDeals} onChange={handleNetworkToggle} color="primary" />} 
                label={<span className="text-sm font-bold text-indigo-900 flex items-center gap-1"><Public fontSize="small"/> Include Network Deals</span>}
            />
            <Typography variant="caption" className="block text-indigo-700 mt-1">
                Show deals shared by partner organizations.
            </Typography>
        </div>

        <div className="mb-6">
          <Typography gutterBottom variant="subtitle2">Price Range</Typography>
          <Slider
            value={[filters.priceMin, filters.priceMax]}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={5000000}
            step={50000}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>${(filters.priceMin/1000).toFixed(0)}k</span>
            <span>${(filters.priceMax/1000).toFixed(0)}k+</span>
          </div>
        </div>

        <div className="mb-6">
          <FormControl fullWidth size="small">
            <InputLabel>Property Type</InputLabel>
            <Select
              value={filters.propertyTypes} // Simplified for demo
              input={<OutlinedInput label="Property Type" />}
              renderValue={(selected) => selected.join(', ')}
              multiple
              onChange={() => {}} // Mock handler
            >
              {['Single Family', 'Multi Family', 'Commercial'].map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={false} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="mb-6">
            <Typography gutterBottom variant="subtitle2" className="mb-2">Value-Add Tags</Typography>
            <div className="flex flex-wrap gap-2">
                {['Fixer', 'Vacant', 'Bank Owned', 'Fire Damage'].map(tag => (
                    <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        onClick={() => {}} 
                        className="cursor-pointer"
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const BrowsePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, selectedId } = useSelector((state: RootState) => state.properties);
  const { viewMode } = useSelector((state: RootState) => state.search);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  useEffect(() => {
    dispatch(fetchProperties({} as any));
  }, [dispatch]);

  const handlePropertySelect = (id: string) => {
    dispatch(selectProperty(id));
    // Scroll list to item if in view
    const el = document.getElementById(`prop-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Sub-header / Filter Toggle */}
      <div className="h-14 border-b border-slate-200 bg-white flex items-center px-4 md:px-6 justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
             <Button 
                startIcon={<FilterList />} 
                color="inherit" 
                size="small"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden"
            >
                Filters
            </Button>
            <Typography variant="body2" className="text-slate-500 hidden md:block">
                {list.length} results found
            </Typography>
        </div>
        <div className="flex items-center gap-2">
            <Typography variant="body2" className="text-slate-500 mr-2">Sort by:</Typography>
            <Select 
                size="small" 
                defaultValue="newest" 
                variant="standard" 
                disableUnderline
                className="font-semibold text-sm"
            >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                <MenuItem value="roi">Projected ROI</MenuItem>
            </Select>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden relative">
        {/* Desktop Filter Panel */}
        <div className="hidden md:block w-80 h-full shrink-0 z-10">
          <FilterPanel />
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            className="md:hidden"
        >
            <FilterPanel />
        </Drawer>

        {/* Results List */}
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-6" id="results-container">
          {loading ? (
             <div className="space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse" />)}
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {list.map(prop => (
                    <div 
                        key={prop.id} 
                        id={`prop-${prop.id}`}
                        className={`transition-all duration-300 ${selectedId === prop.id ? 'ring-2 ring-slate-900 rounded-2xl transform scale-[1.02]' : ''}`}
                        onClick={() => handlePropertySelect(prop.id)}
                    >
                        <PropertyCard property={prop} />
                    </div>
                ))}
            </div>
          )}
        </div>

        {/* Map Side */}
        <div className="hidden lg:block w-[45%] h-full shrink-0 border-l border-slate-200 relative z-0">
            <MapView 
                properties={list} 
                selectedId={selectedId}
                onSelect={handlePropertySelect}
            />
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;
