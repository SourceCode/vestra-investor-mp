import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    CircularProgress,
    Box,
    Button
} from '@mui/material';
import { trpc } from '../../utils/trpc';
import { OfferStatus } from '../../types';

// Removed local UI_OfferStatus in favor of shared OfferStatus

import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useToast } from '../../contexts/ToastContext';

interface OfferListProps {
    dealId?: string;
    className?: string;
}

const OfferList: React.FC<OfferListProps> = ({ dealId, className }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { showToast } = useToast();
    const utils = trpc.useContext();

    // If dealId is provided, we might want to show "My Offers on this Deal" 
    // BUT we only have `byUser` and `byDeal` endpoints.
    // `byDeal` returns ALL offers (agent view).
    // `byUser` returns ALL offers for user.
    // Correct approach for Investor on Property Page: Get `byUser` and filter for this deal.

    const { data: offers, isLoading } = trpc.offer.byUser.useQuery(
        { userId: user?.id! },
        { enabled: !!user?.id }
    );

    const createPayment = trpc.payment.createIntent.useMutation({
        onSuccess: () => {
            showToast('Payment initiated successfully!', 'success');
        },
        onError: (err) => {
            showToast(`Payment failed: ${err.message}`, 'error');
        }
    });

    const processPayment = trpc.payment.process.useMutation({
        onSuccess: () => {
            showToast('Earnest Money Paid Successfully!', 'success');
            utils.offer.byUser.invalidate();
        },
        onError: (err) => {
            showToast(`Payment processing failed: ${err.message}`, 'error');
        }
    });

    const handlePayEMD = async (offerId: string, amount: number) => {
        if (!window.confirm(`Pay Earnest Money of $${amount.toLocaleString()}? This is a mock payment.`)) return;

        try {
            const intent = await createPayment.mutateAsync({
                offerId,
                amount,
                userId: user?.id!
            });

            await processPayment.mutateAsync({ paymentId: intent.id });
        } catch (e) {
            // Error handled in callbacks
        }
    };

    const relevantOffers = dealId
        ? offers?.filter(o => o.dealId === dealId)
        : offers;

    if (isLoading) return <CircularProgress size={20} />;

    if (!relevantOffers || relevantOffers.length === 0) {
        return (
            <div className={`p-4 text-center text-slate-500 bg-slate-50 rounded-lg ${className}`}>
                <Typography variant="body2">No offers submitted yet.</Typography>
            </div>
        );
    }

    const getStatusColor = (status: OfferStatus) => {
        switch (status) {
            case OfferStatus.ACCEPTED: return 'success';
            case OfferStatus.REJECTED: return 'error';
            case OfferStatus.COUNTERED: return 'warning';
            default: return 'default'; // SUBMITTED
        }
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            {relevantOffers.map(offer => (
                <Card key={offer.id} variant="outlined" className="bg-white">
                    <CardContent className="p-3! flex justify-between items-center last:pb-3!">
                        <div>
                            <Typography variant="h6" className="text-slate-900 font-bold text-sm">
                                ${Number(offer.offerAmount).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" className="text-slate-500">
                                {new Date(offer.createdAt).toLocaleDateString()} • {offer.timelineDays} Days Close
                            </Typography>
                            {offer.notes && (
                                <Typography variant="body2" className="text-xs text-slate-600 mt-1 italic">
                                    "{offer.notes}"
                                </Typography>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {offer.status === OfferStatus.ACCEPTED && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handlePayEMD(offer.id, Number(offer.earnestMoney))}
                                    disabled={createPayment.isPending || processPayment.isPending}
                                >
                                    Pay EMD (${Number(offer.earnestMoney).toLocaleString()})
                                </Button>
                            )}
                            <Chip
                                label={offer.status}
                                size="small"
                                color={getStatusColor(offer.status) as any}
                                variant="outlined"
                                className="font-semibold text-xs"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default OfferList;
