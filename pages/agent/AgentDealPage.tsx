import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, Typography, Button, Paper, Chip, Avatar, Divider, Box, Tabs, Tab } from '@mui/material';
import { ArrowBack, CheckCircle, Cancel } from '@mui/icons-material';
import { AppDispatch, RootState, fetchPropertyDetail, acceptOfferRequest } from '../../store';
import PageHeader from '../../components/PageHeader';
import DealStatusChip from '../../components/DealStatusChip';
import TransactionWorkspace from '../../components/transaction/TransactionWorkspace';

const AgentDealPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { detail: property } = useSelector((state: RootState) => state.properties);
    const { byDealId } = useSelector((state: RootState) => state.offers);
    const offers = id ? (byDealId[id] || []) : [];
    
    const [tab, setTab] = useState(0);

    useEffect(() => {
        if (id) dispatch(fetchPropertyDetail(id));
    }, [id, dispatch]);

    const handleAccept = (offerId: string) => {
        if(window.confirm('Are you sure you want to accept this offer?')) {
            dispatch(acceptOfferRequest(offerId));
        }
    };

    if (!property) return <div>Loading...</div>;

    const showTransaction = property.status === 'UNDER_CONTRACT' || property.status === 'OFFER_ACCEPTED' || property.status === 'CLOSED';

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <PageHeader 
                title="Agent Deal Dashboard" 
                subtitle={`Managing: ${property.address}`} 
                actions={
                    <Button startIcon={<ArrowBack />} onClick={() => navigate(`/property/${property.id}`)}>
                        View Public Page
                    </Button>
                }
            />

            <Container maxWidth="xl">
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                        <Tab label="Offers & Status" />
                        {showTransaction && <Tab label="Transaction Management" />}
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Grid container spacing={4}>
                        {/* Left: Property Overview */}
                        <Grid item xs={12} md={4}>
                            <Paper className="p-6 rounded-xl border border-slate-200 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <Typography variant="h6" className="font-bold">Deal Status</Typography>
                                    <DealStatusChip status={property.status} size="medium" />
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>List Price:</span> <b>${property.price.toLocaleString()}</b></div>
                                    <div className="flex justify-between"><span>Offers Received:</span> <b>{offers.length}</b></div>
                                </div>
                            </Paper>
                        </Grid>

                        {/* Right: Offers Panel */}
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" className="font-bold mb-6">Received Offers</Typography>
                            
                            {offers.length === 0 ? (
                                <Paper className="p-12 text-center text-slate-500 rounded-xl border-dashed border-2 border-slate-200">
                                    No offers received yet.
                                </Paper>
                            ) : (
                                <div className="space-y-4">
                                    {offers.map(offer => (
                                        <Paper key={offer.id} className={`p-6 rounded-xl border transition-all ${offer.status === 'ACCEPTED' ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30' : 'border-slate-200'}`}>
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar>{offer.userName[0]}</Avatar>
                                                    <div>
                                                        <Typography variant="h6" className="font-bold">${offer.offerAmount.toLocaleString()}</Typography>
                                                        <Typography variant="body2" className="text-slate-500">
                                                            by {offer.userName} • {offer.timelineDays} Days Close • ${offer.earnestMoney.toLocaleString()} EMD
                                                        </Typography>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {offer.status === 'ACCEPTED' ? (
                                                        <Chip icon={<CheckCircle />} label="Accepted" color="success" />
                                                    ) : offer.status === 'REJECTED' ? (
                                                        <Chip icon={<Cancel />} label="Rejected" color="error" variant="outlined" />
                                                    ) : (
                                                        <>
                                                            <Button variant="outlined" color="error" onClick={() => alert('Reject Mock')}>Reject</Button>
                                                            <Button variant="contained" color="success" onClick={() => handleAccept(offer.id)}>Accept Offer</Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {offer.notes && (
                                                <Box className="mt-4 p-3 bg-slate-100 rounded text-sm text-slate-700 italic">
                                                    "{offer.notes}"
                                                </Box>
                                            )}
                                        </Paper>
                                    ))}
                                </div>
                            )}
                        </Grid>
                    </Grid>
                )}

                {tab === 1 && showTransaction && (
                    <TransactionWorkspace property={property} />
                )}
            </Container>
        </div>
    );
};

export default AgentDealPage;
