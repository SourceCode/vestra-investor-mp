import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, Typography, Button, Tabs, Tab, Box, Chip, Divider, Paper, Alert } from '@mui/material';
import { ArrowBack, Share, Favorite, FavoriteBorder, VerifiedUser, CalendarToday, Build, Lock, Dashboard, Chat } from '@mui/icons-material';
import { AppDispatch, RootState, fetchPropertyDetail, toggleSaveRequest, setOfferDrawerOpen, openConversationForDealRequest } from '../store';
import PropertyCard from '../components/PropertyCard';
import { MOCK_PROPERTIES } from '../constants';
import { useToast } from '../contexts/ToastContext';
import DealStatusChip from '../components/DealStatusChip';
import OfferDrawer from '../components/OfferDrawer';
import ActivityTimeline from '../components/ActivityTimeline';
import TransactionWorkspace from '../components/transaction/TransactionWorkspace';
import SEO from '../components/SEO';

const MetricTile = ({ label, value, subtext }: { label: string, value: string, subtext?: string }) => (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
        <span className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">{label}</span>
        <span className="text-xl font-bold text-slate-900">{value}</span>
        {subtext && <span className="text-xs text-slate-600 mt-1">{subtext}</span>}
    </div>
);

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  
  const { detail: property, loading } = useSelector((state: RootState) => state.properties);
  const { savedIds } = useSelector((state: RootState) => state.saved);
  const { profile } = useSelector((state: RootState) => state.investor);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) dispatch(fetchPropertyDetail(id));
  }, [id, dispatch]);

  if (loading || !property) {
      return (
        <div className="h-screen flex items-center justify-center" aria-live="polite">
            <Typography>Loading property details...</Typography>
        </div>
      );
  }

  const isSaved = savedIds.includes(property.id);
  const isLocked = !isAuthenticated || profile.status === 'LOCKED';
  const isAgent = user?.role === 'ADMIN';
  const showTransaction = property.status === 'UNDER_CONTRACT' || property.status === 'CLOSED';

  const handleSave = () => {
      if (!isAuthenticated) return navigate('/signin');
      dispatch(toggleSaveRequest(property.id));
      showToast(isSaved ? 'Removed from saved' : 'Added to saved');
  };

  const handleMessageAgent = () => {
      if (!isAuthenticated) return navigate('/signin');
      dispatch(openConversationForDealRequest(property.id));
  };

  const canMakeOffer = !isLocked && (property.status === 'PUBLISHED' || property.status === 'OFFER_SUBMITTED');

  // JSON-LD for RealEstateListing
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.address,
    "image": property.images,
    "description": property.description,
    "datePosted": property.createdAt,
    "offers": {
        "@type": "Offer",
        "price": property.price,
        "priceCurrency": "USD",
        "availability": property.status === 'PUBLISHED' ? "https://schema.org/InStock" : "https://schema.org/Sold"
    },
    "address": {
        "@type": "PostalAddress",
        "streetAddress": property.address,
        "addressLocality": property.city,
        "addressRegion": property.state,
        "postalCode": property.zip,
        "addressCountry": "US"
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
        <SEO 
            title={`${property.address} | ${property.city}, ${property.state}`}
            description={`Investment opportunity: ${property.beds} bed, ${property.baths} bath in ${property.city}. ${property.description}`}
            schema={schema}
            canonical={`${window.location.origin}/property/${property.id}`}
        />

        <OfferDrawer property={property} />

        {/* Gallery Hero - Using fetchpriority="high" for LCP */}
        <section className="h-[50vh] md:h-[60vh] relative grid grid-cols-4 grid-rows-2 gap-1 bg-slate-900" aria-label="Property Images">
             <div className="col-span-2 row-span-2 relative overflow-hidden">
                 <img 
                    src={property.images[0]} 
                    alt={`Front view of ${property.address}`} 
                    className={`w-full h-full object-cover ${isLocked ? 'blur-sm' : ''}`} 
                    // @ts-ignore - fetchpriority is valid in modern browsers but maybe not in TS types yet
                    fetchpriority="high"
                 />
                 <Button 
                    startIcon={<ArrowBack />} 
                    className="absolute top-6 left-6 bg-white/90 hover:bg-white text-slate-900 rounded-full pl-4 pr-6 z-10"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                >
                    Back
                 </Button>
                 {isLocked && <div className="absolute inset-0 flex items-center justify-center z-0">
                     <Button variant="contained" onClick={() => navigate('/access-request')}>Request Access for Photos</Button>
                 </div>}
             </div>
             {[1, 2, 3].map((idx, i) => (
                  <div key={idx} className={`col-span-${i === 2 ? 2 : 1} row-span-1 relative overflow-hidden`}>
                     <img 
                        src={property.images[i] || property.images[0]} 
                        alt={`Property view ${i + 2}`} 
                        className={`w-full h-full object-cover ${isLocked ? 'blur-sm' : ''}`} 
                        loading="lazy"
                     />
                 </div>
             ))}
        </section>

        <Container maxWidth="lg" className="mt-8">
            <Grid container spacing={6}>
                <Grid item xs={12} md={showTransaction ? 12 : 8}>
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex gap-2 mb-2">
                                    <DealStatusChip status={property.status} />
                                    {property.biddingEnabled && <Chip label="Bidding Active" color="warning" size="small" className="font-bold" />}
                                    {property.tags.map(tag => <Chip key={tag} label={tag} variant="outlined" size="small" />)}
                                </div>
                                <Typography variant="h1" className="font-bold text-slate-900 !text-3xl sm:!text-4xl mb-1">
                                    {isLocked ? 'Unlisted Address' : property.address}
                                </Typography>
                                <Typography variant="h2" component="p" className="text-slate-500 font-normal !text-xl">
                                    {property.city}, {property.state} {property.zip}
                                </Typography>
                            </div>
                            <div className="text-right hidden md:block">
                                <Typography variant="h2" component="div" className="font-bold text-slate-900 !text-3xl">
                                    ${property.price.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" className="text-slate-500">List Price</Typography>
                                {property.biddingEnabled && property.currentBid && (
                                    <Typography variant="caption" className="text-emerald-700 font-bold block mt-1">
                                        Current Bid: ${property.currentBid.toLocaleString()}
                                    </Typography>
                                )}
                            </div>
                        </div>

                        {isLocked ? (
                            <Alert severity="info" className="mb-6" icon={<Lock />}>
                                Full property details, financials, and address are reserved for verified investors.
                            </Alert>
                        ) : (
                            <div className="flex gap-8 py-4 border-y border-slate-100" aria-label="Quick property stats">
                                <div className="flex items-center gap-2"><div className="font-bold text-lg">{property.beds}</div> <span className="text-slate-500">Beds</span></div>
                                <div className="flex items-center gap-2"><div className="font-bold text-lg">{property.baths}</div> <span className="text-slate-500">Baths</span></div>
                                <div className="flex items-center gap-2"><div className="font-bold text-lg">{property.sqft.toLocaleString()}</div> <span className="text-slate-500">Sqft</span></div>
                                <div className="flex items-center gap-2"><div className="font-bold text-lg">{property.yearBuilt}</div> <span className="text-slate-500">Year</span></div>
                            </div>
                        )}
                    </div>

                    {/* Content Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="mb-6">
                        <Tabs 
                            value={tabValue} 
                            onChange={(e, v) => setTabValue(v)} 
                            textColor="primary" 
                            indicatorColor="primary"
                            aria-label="Property detail tabs"
                        >
                            <Tab label="Overview" id="tab-0" aria-controls="panel-0" />
                            <Tab label="Financials" id="tab-1" aria-controls="panel-1" />
                            <Tab label="Activity" id="tab-2" aria-controls="panel-2" />
                            { showTransaction && <Tab label="Transaction Workspace" id="tab-3" aria-controls="panel-3" /> }
                        </Tabs>
                    </Box>
                    
                    <div role="tabpanel" hidden={tabValue !== 0} id="panel-0" aria-labelledby="tab-0">
                        {tabValue === 0 && (
                            <Grid container spacing={6}>
                                <Grid item xs={12} md={8}>
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <MetricTile label="Est. ARV" value={`$${(property.metrics.arv/1000).toFixed(0)}k`} />
                                            <MetricTile label="Rehab Est." value={`$${(property.metrics.rehabEst/1000).toFixed(0)}k`} />
                                            <MetricTile label="Proj. ROI" value={`${property.metrics.projectedRoi}%`} subtext="Cash on Cash" />
                                            <MetricTile label="Cap Rate" value={`${property.metrics.capRate}%`} />
                                        </div>

                                        <section aria-labelledby="desc-heading">
                                            <Typography id="desc-heading" variant="h3" className="sr-only">Description</Typography>
                                            <Typography variant="body1" className="text-slate-700 leading-relaxed text-lg">
                                                {property.description}
                                            </Typography>
                                        </section>
                                        
                                        <section aria-labelledby="features-heading">
                                            <Typography id="features-heading" variant="h5" component="h3" className="font-bold mb-4">Property Features</Typography>
                                            <div className="grid grid-cols-2 gap-y-2">
                                                <div className="flex items-center gap-2 text-slate-700"><VerifiedUser fontSize="small" className="text-teal-600"/> Clear Title</div>
                                                <div className="flex items-center gap-2 text-slate-700"><CalendarToday fontSize="small" className="text-teal-600"/> Immediate Possession</div>
                                                <div className="flex items-center gap-2 text-slate-700"><Build fontSize="small" className="text-teal-600"/> Full Reno Required</div>
                                            </div>
                                        </section>
                                    </div>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <aside className="sticky top-24 space-y-6">
                                        {isAgent && (
                                            <Paper className="p-4 bg-slate-800 text-white rounded-xl mb-4">
                                                <Typography variant="h6" className="font-bold mb-2">Agent Controls</Typography>
                                                <Button 
                                                    variant="contained" 
                                                    color="secondary" 
                                                    fullWidth 
                                                    startIcon={<Dashboard />}
                                                    onClick={() => navigate(`/agent/deals/${property.id}`)}
                                                >
                                                    Manage Deal
                                                </Button>
                                            </Paper>
                                        )}

                                        <Paper elevation={0} className="border border-slate-200 p-6 rounded-2xl">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 bg-slate-200 rounded-full" aria-hidden="true"></div>
                                                <div>
                                                    <Typography variant="subtitle2" className="font-bold">Listing Agent</Typography>
                                                    <Typography variant="body2" className="text-slate-600">Premier Realty Group</Typography>
                                                </div>
                                            </div>
                                            
                                            <Button 
                                                fullWidth 
                                                variant="contained" 
                                                size="large" 
                                                className="mb-3 h-12 text-lg"
                                                onClick={() => isLocked ? navigate('/access-request') : dispatch(setOfferDrawerOpen(true))}
                                                disabled={!isLocked && !canMakeOffer}
                                            >
                                                {isLocked ? 'Request Access' : (canMakeOffer ? (property.biddingEnabled ? 'Place Bid' : 'Make Offer') : 'Offer Closed')}
                                            </Button>
                                            
                                            <Button 
                                                fullWidth 
                                                variant="outlined" 
                                                size="large" 
                                                className="mb-3 h-12" 
                                                onClick={handleMessageAgent}
                                                startIcon={<Chat />}
                                                disabled={isLocked}
                                            >
                                                Message Agent
                                            </Button>

                                            <div className="flex justify-center gap-4 mt-4">
                                                <Button 
                                                    startIcon={isSaved ? <Favorite className="text-rose-500"/> : <FavoriteBorder />} 
                                                    size="small" 
                                                    color="inherit"
                                                    onClick={handleSave}
                                                >
                                                    {isSaved ? 'Saved' : 'Save'}
                                                </Button>
                                                <Button startIcon={<Share />} size="small" color="inherit">Share</Button>
                                            </div>
                                        </Paper>
                                    </aside>
                                </Grid>
                            </Grid>
                        )}
                    </div>

                    <div role="tabpanel" hidden={tabValue !== 1} id="panel-1" aria-labelledby="tab-1">
                     {tabValue === 1 && (
                         <div className="relative max-w-4xl">
                             <Paper variant="outlined" className={`p-6 bg-slate-50 ${isLocked ? 'blur-sm select-none' : ''}`}>
                                 <Typography variant="h5" component="h3" className="font-bold mb-4">Pro Forma Analysis</Typography>
                                 <div className="space-y-3">
                                    <div className="flex justify-between"><span>Purchase Price</span> <span>${property.price.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>Closing Costs (2%)</span> <span>${(property.price * 0.02).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>Est. Rehab</span> <span>${property.metrics.rehabEst.toLocaleString()}</span></div>
                                    <Divider />
                                    <div className="flex justify-between font-bold"><span>Total Investment</span> <span>${(property.price * 1.02 + property.metrics.rehabEst).toLocaleString()}</span></div>
                                    <div className="h-4"></div>
                                    <div className="flex justify-between text-emerald-700 font-bold"><span>Projected Profit</span> <span>${(property.metrics.arv - (property.price * 1.02 + property.metrics.rehabEst)).toLocaleString()}</span></div>
                                 </div>
                             </Paper>
                             {isLocked && (
                                 <div className="absolute inset-0 flex items-center justify-center">
                                     <Button variant="contained" onClick={() => navigate('/access-request')}>Request Access to Financials</Button>
                                 </div>
                             )}
                         </div>
                     )}
                    </div>

                    <div role="tabpanel" hidden={tabValue !== 2} id="panel-2" aria-labelledby="tab-2">
                     {tabValue === 2 && <div className="max-w-4xl"><ActivityTimeline /></div>}
                    </div>

                    <div role="tabpanel" hidden={tabValue !== 3} id="panel-3" aria-labelledby="tab-3">
                     {tabValue === 3 && showTransaction && <TransactionWorkspace property={property} />}
                    </div>
                </Grid>
            </Grid>
            
            <Divider className="my-16" />

            <section aria-labelledby="similar-heading">
                <Typography id="similar-heading" variant="h4" component="h2" className="font-bold mb-6 !text-2xl">Similar Opportunities</Typography>
                <Grid container spacing={3}>
                    {MOCK_PROPERTIES.filter(p => p.id !== property.id).slice(0, 4).map(p => (
                        <Grid item xs={12} sm={6} md={3} key={p.id}>
                            <PropertyCard property={p} compact />
                        </Grid>
                    ))}
                </Grid>
            </section>
        </Container>
    </div>
  );
};

export default PropertyDetailPage;