import { LocationOn, PieChart, Security, Speed, TrendingUp } from '@mui/icons-material';
import { Box, Button, Container, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PropertyCard from '../components/PropertyCard';
import SEO from '../components/SEO';
import { MOCK_PROPERTIES } from '../constants';
import { useTenant } from '../contexts/TenantConfigContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const tenant = useTenant();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/browse');
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': tenant.name,
    'potentialAction': {
      '@type': 'SearchAction',
      'query-input': 'required name=search_term_string',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${window.location.origin}/browse?q={search_term_string}`
      }
    },
    'publisher': {
      '@type': 'Organization',
      'logo': {
        '@type': 'ImageObject',
        'url': tenant.logoUrl || 'https://vestra.com/logo.png'
      },
      'name': tenant.name
    },
    'url': window.location.origin
  };

  return (
    <div className="flex flex-col w-full bg-white">
      <SEO
        title="Value-Add Real Estate Marketplace"
        description="The world's premier marketplace for fix-and-flip, BRRRR, and value-add real estate investing."
        schema={schema}
        canonical={window.location.origin}
      />

      {/* Hero Section */}
      <section className="relative bg-slate-900 pt-32 pb-40 overflow-hidden" aria-labelledby="hero-title">

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-slate-800/40 to-transparent pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <Container maxWidth="lg" className="relative z-10">
          <div className="flex flex-col items-center justify-center text-center mx-auto max-w-5xl px-4">

            {/* Main Headline */}
            <Typography
              id="hero-title"
              variant="h1"
              component="h1"
              className="text-white font-bold tracking-tight mb-8 text-center mx-auto"
              sx={{
                fontSize: { lg: '5rem', md: '4rem', xs: '2.75rem' },
                lineHeight: { md: 1.1, xs: 1.1 },
                maxWidth: '900px'
              }}
            >
              Find your next <span className="text-teal-400">value-add</span> opportunity.
            </Typography>

            {/* Subheadline */}
            <Typography
              variant="h5"
              component="p"
              className="text-slate-300 mb-12 font-normal leading-relaxed text-center mx-auto"
              sx={{
                fontSize: { md: '1.35rem', xs: '1.125rem' },
                maxWidth: '700px'
              }}
            >
              The world's premier marketplace for fix-and-flip, BRRRR, and value-add real estate investing.
            </Typography>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto relative mb-10" role="search">
              <label htmlFor="hero-search" className="sr-only">Search by city, zip, or neighborhood</label>
              <TextField
                id="hero-search"
                fullWidth
                variant="outlined"
                placeholder="Search by city, zip, or neighborhood..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  className: 'bg-white rounded-full pr-2 pl-4 py-2 h-14 text-lg shadow-2xl',
                  endAdornment: (
                    <Button
                      variant="contained"
                      color="secondary"
                      type="submit"
                      className="rounded-full px-8 h-10 font-bold"
                      disableElevation
                    >
                      Search
                    </Button>
                  ),
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn className="text-slate-400" aria-hidden="true" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '& .MuiOutlinedInput-root': { paddingRight: '6px' }
                }}
              />
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400 font-medium">
              <span className="text-slate-500">Popular:</span>
              <button onClick={() => navigate('/browse?q=Los Angeles')} className="bg-transparent border-0 p-0 text-white hover:text-teal-400 cursor-pointer transition-colors border-b border-white/20 hover:border-teal-400 pb-0.5">Los Angeles</button>
              <button onClick={() => navigate('/browse?type=Multi-family')} className="bg-transparent border-0 p-0 text-white hover:text-teal-400 cursor-pointer transition-colors border-b border-white/20 hover:border-teal-400 pb-0.5">Multi-family</button>
              <button onClick={() => navigate('/browse?tag=Fixer')} className="bg-transparent border-0 p-0 text-white hover:text-teal-400 cursor-pointer transition-colors border-b border-white/20 hover:border-teal-400 pb-0.5">Fixer Upper</button>
            </div>

          </div>
        </Container>
      </section>

      {/* Trust Strip */}
      <section className="bg-white border-b border-slate-100 py-12" aria-label="Trusted by">
        <Container maxWidth="lg">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-16 opacity-100">
            {/* Mock Logo 1 */}
            <div className="flex items-center gap-2 group select-none opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default grayscale hover:grayscale-0">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-serif font-bold text-lg" aria-hidden="true">V</div>
              <span className="font-bold text-xl text-black tracking-tight">VESTRA</span>
            </div>
            {/* Mock Logo 2 */}
            <div className="flex items-center gap-2 group select-none opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default grayscale hover:grayscale-0">
              <div className="w-8 h-8 rounded-full border-4 border-black box-border" aria-hidden="true"></div>
              <span className="font-bold text-xl text-black tracking-tight">OPENDOOR</span>
            </div>
            {/* Mock Logo 3 */}
            <div className="flex items-center gap-2 group select-none opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default grayscale hover:grayscale-0">
              <div className="flex space-x-0.5" aria-hidden="true">
                <div className="w-2 h-6 bg-black"></div>
                <div className="w-2 h-4 self-end bg-black"></div>
                <div className="w-2 h-8 self-end bg-black"></div>
              </div>
              <span className="font-bold text-xl text-black tracking-tight">REALDATA</span>
            </div>
            {/* Mock Logo 4 */}
            <div className="flex items-center gap-2 group select-none opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default grayscale hover:grayscale-0">
              <div className="w-6 h-6 bg-black transform rotate-45" aria-hidden="true"></div>
              <span className="font-bold text-xl text-black tracking-tight">ZILLOW</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Section */}
      <section className="py-20" aria-labelledby="featured-heading">
        <Container maxWidth="lg">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <Typography id="featured-heading" variant="h2" component="h2" className="font-bold text-slate-900 mb-2 !text-3xl">Featured Deals</Typography>
              <Typography variant="body1" className="text-slate-600">High-potential properties dropped this week.</Typography>
            </div>
            <Button
              variant="outlined"
              endIcon={<TrendingUp aria-hidden="true" />}
              onClick={() => navigate('/browse')}
              className="border-slate-300 text-slate-700 w-full md:w-auto"
            >
              View all properties
            </Button>
          </div>

          <Grid container spacing={3}>
            {MOCK_PROPERTIES.slice(0, 4).map((prop) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={prop.id}>
                <PropertyCard property={prop} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Why Vestra Section */}
      <section className="bg-slate-50 py-24" aria-labelledby="why-heading">
        <Container maxWidth="lg">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Typography id="why-heading" variant="h2" component="h2" className="font-bold text-slate-900 mb-4 !text-3xl" align="center">Built for investors, by investors.</Typography>
            <Typography variant="body1" className="text-slate-600 text-lg" align="center">
              Stop digging through retail listings. Get straight to the numbers that matter.
            </Typography>
          </div>

          <Grid container spacing={8}>
            {[
              { desc: 'Every listing is pre-vetted for investment potential with clear value-add angles.', icon: <PieChart fontSize="large" aria-hidden="true" />, title: 'Curated Deals' },
              { desc: 'Instant access to ARV, rehab estimates, and projected ROI calculators.', icon: <Speed fontSize="large" aria-hidden="true" />, title: 'Fast Underwriting' },
              { desc: 'Make offers with confidence using our standardized contract and closing process.', icon: <Security fontSize="large" aria-hidden="true" />, title: 'Transparent Bids' }
            ].map((item, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-teal-600 mb-6">
                    {item.icon}
                  </div>
                  <Typography variant="h6" component="h3" className="font-bold mb-2 text-slate-900">{item.title}</Typography>
                  <Typography variant="body2" className="text-slate-600 leading-relaxed">{item.desc}</Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;