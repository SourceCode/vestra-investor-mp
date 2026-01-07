import { ArrowBack, Cancel, CheckCircle } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Container, Divider, Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import DealStatusChip from '../../components/DealStatusChip';
import PageHeader from '../../components/PageHeader';
import TransactionWorkspace from '../../components/transaction/TransactionWorkspace';
import { useToast } from '../../contexts/ToastContext';
import { OfferStatus } from '../../types';
import { AppDispatch, fetchPropertyDetail, RootState } from '../../store';
import { trpc } from '../../utils/trpc';

const AgentDealPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { showToast } = useToast();
    const utils = trpc.useContext();

    const { detail: property } = useSelector((state: RootState) => state.properties);

    // Fetch offers via tRPC
    const { data: offers = [], isLoading: isLoadingOffers } = trpc.offer.byDeal.useQuery({ dealId: id! }, {
        enabled: !!id
    });

    // Mutation for status updates
    const updateStatus = trpc.offer.updateStatus.useMutation({
        onSuccess: () => {
            showToast('Offer status updated successfully', 'success');
            if (id) utils.offer.byDeal.invalidate({ dealId: id });
        },
        onError: (err) => {
            showToast(`Failed to update status: ${err.message}`, 'error');
        }
    });

    const [tab, setTab] = useState(0);

    useEffect(() => {
        if (id) dispatch(fetchPropertyDetail(id));
    }, [id, dispatch]);

    const handleStatusUpdate = (offerId: string, status: OfferStatus) => {
        if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this offer?`)) {
            updateStatus.mutate({
                id: offerId,
                status
            });
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
                        <Grid size={{ xs: 12, md: 4 }}>
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
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Typography variant="h5" className="font-bold mb-6">Received Offers</Typography>

                            {isLoadingOffers ? (
                                <div className="text-center py-8">Loading offers...</div>
                            ) : offers.length === 0 ? (
                                <Paper className="p-12 text-center text-slate-500 rounded-xl border-dashed border-2 border-slate-200">
                                    No offers received yet.
                                </Paper>
                            ) : (
                                <div className="space-y-4">
                                    {offers.map(offer => (
                                        <Paper key={offer.id} className={`p-6 rounded-xl border transition-all ${offer.status === OfferStatus.ACCEPTED ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30' : 'border-slate-200'}`}>
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar>{offer.user?.firstName?.[0] || '?'}</Avatar>
                                                    <div>
                                                        <Typography variant="h6" className="font-bold">${Number(offer.offerAmount).toLocaleString()}</Typography>
                                                        <Typography variant="body2" className="text-slate-500">
                                                            by {offer.user ? `${offer.user.firstName} ${offer.user.lastName}` : 'Unknown'} • {offer.timelineDays} Days Close • ${Number(offer.earnestMoney).toLocaleString()} EMD
                                                        </Typography>
                                                        <Typography variant="caption" className="text-slate-400">
                                                            {new Date(offer.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {offer.status === OfferStatus.ACCEPTED ? (
                                                        <Chip icon={<CheckCircle />} label="Accepted" color="success" />
                                                    ) : offer.status === OfferStatus.REJECTED ? (
                                                        <Chip icon={<Cancel />} label="Rejected" color="error" variant="outlined" />
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                disabled={updateStatus.isPending}
                                                                onClick={() => handleStatusUpdate(offer.id, OfferStatus.REJECTED)}
                                                            >
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                disabled={updateStatus.isPending}
                                                                onClick={() => handleStatusUpdate(offer.id, OfferStatus.ACCEPTED)}
                                                            >
                                                                Accept
                                                            </Button>
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
