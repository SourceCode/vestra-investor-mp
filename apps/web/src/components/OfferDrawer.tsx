import { Close, Gavel, MonetizationOn } from '@mui/icons-material';
import { Alert, Box, Button, Divider, Drawer, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useToast } from '../contexts/ToastContext';
import { RootState, setOfferDrawerOpen } from '../store';
import { Property } from '../types';
import { trpc } from '../utils/trpc';

interface OfferDrawerProps {
    property: Property;
}

const OfferDrawer: React.FC<OfferDrawerProps> = ({ property }) => {
    const dispatch = useDispatch();
    const { isOpen } = useSelector((state: RootState) => ({ isOpen: state.ui.isOfferDrawerOpen }));
    const { user } = useSelector((state: RootState) => state.auth);
    const { showToast } = useToast();
    const utils = trpc.useContext();

    const [offerAmount, setOfferAmount] = useState<number>(property.price);
    const [earnestMoney, setEarnestMoney] = useState<number>(5000);
    const [timeline, setTimeline] = useState(30);
    const [notes, setNotes] = useState('');

    const createOffer = trpc.offer.create.useMutation({
        onSuccess: () => {
            showToast('Offer submitted successfully!', 'success');
            dispatch(setOfferDrawerOpen(false));
            // Invalidate queries to refresh lists
            utils.offer.byUser.invalidate();
            utils.offer.byDeal.invalidate();
        },
        onError: (err) => {
            showToast(`Failed to submit offer: ${err.message}`, 'error');
        }
    });

    const isBidding = property.biddingEnabled;
    const minBid = property.currentBid ? property.currentBid + 5000 : property.price;

    const handleSubmit = () => {
        if (!user?.id) {
            showToast('You must be logged in to submit an offer', 'error');
            return;
        }

        if (isBidding && offerAmount < minBid) {
            showToast(`Bid must be at least $${minBid.toLocaleString()}`, 'error');
            return;
        }

        createOffer.mutate({
            dealId: property.id,
            userId: user.id,
            amount: offerAmount,
            earnestMoney,
            timelineDays: timeline,
            notes
        });
    };

    return (
        <Drawer
            anchor="right"
            open={isOpen}
            onClose={() => dispatch(setOfferDrawerOpen(false))}
            PaperProps={{ sx: { padding: 0, width: { sm: 400, xs: '100%' } } }}
        >
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <Typography variant="h6" className="font-bold">
                        {isBidding ? 'Place Bid' : 'Submit Offer'}
                    </Typography>
                    <IconButton onClick={() => dispatch(setOfferDrawerOpen(false))}>
                        <Close />
                    </IconButton>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    {/* Summary */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <Typography variant="subtitle2" className="text-slate-500 mb-1">{property.address}</Typography>
                        <Typography variant="h5" className="font-bold text-slate-900">${property.price.toLocaleString()}</Typography>
                        {isBidding && (
                            <div className="mt-2 text-sm text-emerald-600 font-bold flex items-center gap-1">
                                <Gavel fontSize="small" /> Current High Bid: ${property.currentBid?.toLocaleString() || property.price.toLocaleString()}
                            </div>
                        )}
                    </div>

                    <Divider />

                    {/* Form */}
                    <div className="space-y-4">
                        <TextField
                            label={isBidding ? 'Your Max Bid' : 'Offer Price'}
                            type="number"
                            fullWidth
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(Number(e.target.value))}
                            InputProps={{ startAdornment: <div className="mr-1">$</div> }}
                            helperText={isBidding ? `Minimum bid: $${minBid.toLocaleString()}` : undefined}
                            error={isBidding && offerAmount < minBid}
                        />

                        <TextField
                            label="Earnest Money Deposit"
                            type="number"
                            fullWidth
                            value={earnestMoney}
                            onChange={(e) => setEarnestMoney(Number(e.target.value))}
                            InputProps={{ startAdornment: <div className="mr-1">$</div> }}
                        />

                        <TextField
                            select
                            label="Closing Timeline"
                            fullWidth
                            value={timeline}
                            onChange={(e) => setTimeline(Number(e.target.value))}
                        >
                            <MenuItem value={7}>7 Days (All Cash)</MenuItem>
                            <MenuItem value={14}>14 Days (Fast)</MenuItem>
                            <MenuItem value={21}>21 Days (Standard)</MenuItem>
                            <MenuItem value={30}>30 Days (Financed)</MenuItem>
                        </TextField>

                        <TextField
                            label="Notes to Seller"
                            multiline
                            rows={4}
                            fullWidth
                            placeholder="We are ready to close immediately..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Confidence Cue */}
                    {!isBidding && offerAmount < property.price * 0.9 && (
                        <Alert severity="warning">Your offer is significantly below asking price. Consider adding strong terms.</Alert>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-white">
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleSubmit}
                        disabled={createOffer.isPending}
                        className="h-12 text-lg"
                    >
                        {createOffer.isPending ? 'Submitting...' : (isBidding ? 'Place Bid' : 'Submit Offer')}
                    </Button>
                </div>
            </div>
        </Drawer>
    );
};

export default OfferDrawer;
