import { Avatar, Paper, Typography } from '@mui/material';
import React, { useEffect } from 'react';

import DealStatusChip from '../../components/DealStatusChip';
import { mockApi } from '../../mocks/api';
import { DealStatus, Offer } from '../../types';

const OfferCard: React.FC<{ offer: Offer }> = ({ offer }) => (
    <Paper className="p-4 mb-3 rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <Avatar sx={{ fontSize: 12, height: 24, width: 24 }}>{offer.userName[0]}</Avatar>
                <Typography variant="subtitle2" className="font-bold">{offer.userName}</Typography>
            </div>
            <span className="text-xs text-slate-400">{new Date(offer.timestamp).toLocaleDateString()}</span>
        </div>
        <Typography variant="h6" className="font-bold text-slate-900 mb-1">${offer.offerAmount.toLocaleString()}</Typography>
        <Typography variant="caption" className="text-slate-500 block mb-2">
            EMD: ${offer.earnestMoney.toLocaleString()} • {offer.timelineDays} Day Close
        </Typography>
        <div className="flex justify-end">
            <DealStatusChip
                status={
                    offer.status === 'SUBMITTED' ? DealStatus.OFFER_SUBMITTED :
                        offer.status === 'ACCEPTED' ? DealStatus.OFFER_ACCEPTED :
                            DealStatus.CANCELLED
                }
                size="small"
            />
        </div>
    </Paper>
);

const AgentOffersPage: React.FC = () => {
    // Using simple mock fetch for demo as we don't have a global offers list in store yet, usually done via selector
    const [allOffers, setAllOffers] = React.useState<Offer[]>([]);

    useEffect(() => {
        // Mock fetching all offers
        mockApi.fetchOffers('1').then(res => setAllOffers(res));
    }, []);

    return (
        <div>
            <Typography variant="h4" className="font-bold mb-6">Offers Review</Typography>

            <div className="flex gap-4 overflow-x-auto pb-4">
                {/* Column: New */}
                <div className="min-w-[320px] bg-slate-50 p-4 rounded-xl h-[calc(100vh-200px)] overflow-y-auto">
                    <Typography variant="subtitle1" className="font-bold mb-4 text-slate-600 uppercase text-xs tracking-wider">New / Pending</Typography>
                    {allOffers.filter(o => o.status === 'SUBMITTED').map(o => <OfferCard key={o.id} offer={o} />)}
                    {allOffers.filter(o => o.status === 'SUBMITTED').length === 0 && <div className="text-center text-slate-400 text-sm py-4">No pending offers</div>}
                </div>

                {/* Column: Under Review (Mock) */}
                <div className="min-w-[320px] bg-slate-50 p-4 rounded-xl h-[calc(100vh-200px)] overflow-y-auto">
                    <Typography variant="subtitle1" className="font-bold mb-4 text-slate-600 uppercase text-xs tracking-wider">Under Review</Typography>
                    <div className="text-center text-slate-400 text-sm py-4">Drag offers here</div>
                </div>

                {/* Column: Accepted */}
                <div className="min-w-[320px] bg-emerald-50/50 p-4 rounded-xl h-[calc(100vh-200px)] overflow-y-auto border border-emerald-100">
                    <Typography variant="subtitle1" className="font-bold mb-4 text-emerald-700 uppercase text-xs tracking-wider">Accepted</Typography>
                    {allOffers.filter(o => o.status === 'ACCEPTED').map(o => <OfferCard key={o.id} offer={o} />)}
                </div>
            </div>
        </div>
    );
};

export default AgentOffersPage;