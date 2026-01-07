import { FilterList, Public, Save } from '@mui/icons-material';
import {
  Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Drawer, FormControl, FormControlLabel, InputLabel, ListItemText, MenuItem,
  OutlinedInput, Select, Slider, Switch, TextField, Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MapView from '../components/MapView';
import PropertyCard from '../components/PropertyCard';
import { AppDispatch, RootState, selectProperty, setFilters, setQuery } from '../store';
import { trpc } from '../utils/trpc';
import SearchBar from '../components/marketplace/SearchBar';
import SEO from '../components/SEO';
import { SearchFrequency } from '../db/entities/SavedSearch.entity';
import { Property } from '../types';

// Filter Component
const FilterPanel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.search.filters);
  const query = useSelector((state: RootState) => state.search.query);

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      dispatch(setFilters({ priceMax: newValue[1], priceMin: newValue[0] }));
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
            label={<span className="text-sm font-bold text-indigo-900 flex items-center gap-1"><Public fontSize="small" /> Include Network Deals</span>}
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
            <span>${(filters.priceMin / 1000).toFixed(0)}k</span>
            <span>${(filters.priceMax / 1000).toFixed(0)}k+</span>
          </div>
        </div>

        <div className="mb-6">
          <FormControl fullWidth size="small">
            <InputLabel>Property Type</InputLabel>
            <Select
              value={filters.propertyTypes}
              input={<OutlinedInput label="Property Type" />}
              renderValue={(selected) => selected.join(', ')}
              multiple
              onChange={() => { }} // Mock handler
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
                onClick={() => { }}
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
  const { filters, query } = useSelector((state: RootState) => state.search);
  const { selectedId } = useSelector((state: RootState) => state.properties);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sort, setSort] = React.useState<'newest' | 'price_asc' | 'price_desc' | 'relevance'>('newest');

  // Save Search State
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchFrequency, setSearchFrequency] = useState<SearchFrequency>(SearchFrequency.WEEKLY);

  const utils = trpc.useContext();
  const saveSearchMutation = trpc.savedSearch.create.useMutation({
    onSuccess: () => {
      setIsSaveSearchOpen(false);
      setSearchName('');
      utils.savedSearch.list.invalidate();
    }
  });

  const handleSaveSearch = () => {
    // Assuming user is logged in (mock ID for now if not available in redux, but likely is)
    const userId = 'user-uuid-placeholder'; // TODO: Replace with real user ID from auth slice

    saveSearchMutation.mutate({
      name: searchName,
      criteria: {
        text: query,
        ...filters
      },
      frequency: searchFrequency,
      organizationId: 'org-id-placeholder', // TODO: Replace with real org ID
      userId
    });
  };

  // Use tRPC for data fetching
  const { data: list = [], isLoading: loading } = trpc.marketplace.getListings.useQuery({
    text: query,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    location: filters.location,
    propertyTypes: filters.propertyTypes,
    includeNetworkDeals: filters.includeNetworkDeals,
    sortBy: sort
  });

  const handleSearch = (q: string) => {
    dispatch(setQuery(q));
  };

  const handlePropertySelect = (id: string) => {
    dispatch(selectProperty(id));
    const el = document.getElementById(`prop-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': query ? 'SearchResultsPage' : 'CollectionPage',
    'name': query ? `Search Results for "${query}"` : 'Browse Properties',
    'description': `Browse available value-add real estate properties${query ? ` matching "${query}"` : ''}.`,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': list.map((item, index: number) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'url': `${window.location.origin}/property/${item.id}`,
        'name': item.address
      }))
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <SEO
        title={query ? `Search: ${query}` : 'Browse Properties'}
        description="Find value-add investment properties, fix-and-flips, and BRRRR opportunities."
        schema={schema}
        canonical={`${window.location.origin}/browse`}
      />
      {/* Sub-header / Search & Filter */}
      <div className="h-auto min-h-16 border-b border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center px-4 md:px-6 py-2 gap-4 shrink-0 z-20">
        <div className="w-full md:w-96">
          <SearchBar onSearch={handleSearch} initialValue={query} placeholder="Search properties, locations..." />
        </div>

        <div className="flex flex-1 w-full justify-between items-center">
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
            <Button
              startIcon={<Save />}
              size="small"
              variant="outlined"
              onClick={() => setIsSaveSearchOpen(true)}
              className="mr-2"
            >
              Save Search
            </Button>
            <Typography variant="body2" className="text-slate-500 mr-2">Sort by:</Typography>
            <Select
              size="small"
              value={sort}
              onChange={(e) => setSort(e.target.value as 'newest' | 'price_asc' | 'price_desc' | 'relevance')}
              variant="standard"
              disableUnderline
              className="font-semibold text-sm"
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price_asc">Price: Low to High</MenuItem>
              <MenuItem value="price_desc">Price: High to Low</MenuItem>
              <MenuItem value="relevance">Relevance</MenuItem>
            </Select>
          </div>
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
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {list.map((prop) => (
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

      <Dialog open={isSaveSearchOpen} onClose={() => setIsSaveSearchOpen(false)}>
        <DialogTitle>Save this Search</DialogTitle>
        <DialogContent className="w-96 flex flex-col gap-4 pt-4">
          <TextField
            autoFocus
            label="Search Name"
            fullWidth
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Notification Frequency</InputLabel>
            <Select
              value={searchFrequency}
              label="Notification Frequency"
              onChange={(e) => setSearchFrequency(e.target.value as SearchFrequency)}
            >
              {Object.values(SearchFrequency).map((freq) => (
                <MenuItem key={freq} value={freq}>{freq}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSaveSearchOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSearch} variant="contained" disabled={!searchName}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BrowsePage;
