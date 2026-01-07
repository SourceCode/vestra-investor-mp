import { CardGiftcard, EmojiEvents, History } from '@mui/icons-material';
import { Button, Chip, Grid, LinearProgress, Paper, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AccountShell from '../../components/AccountShell';
import { useToast } from '../../contexts/ToastContext';
import { fetchRewardsRequest, redeemRewardRequest, RootState } from '../../store';

const LoyaltyPage: React.FC = () => {
    const dispatch = useDispatch();
    const { catalog, history, loading, pointsBalance } = useSelector((state: RootState) => state.rewards);
    const { showToast } = useToast();

    useEffect(() => {
        dispatch(fetchRewardsRequest());
    }, [dispatch]);

    const handleRedeem = (id: string, title: string) => {
        dispatch(redeemRewardRequest(id));
        showToast(`Redeemed: ${title}`);
    };

    const nextTier = 25000;
    const progress = Math.min((pointsBalance / nextTier) * 100, 100);

    return (
        <AccountShell title="Rewards & Loyalty">
            <div className="mb-8 p-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Typography variant="overline" className="text-slate-400 font-bold tracking-wider">Current Balance</Typography>
                        <div className="flex items-baseline gap-2">
                            <Typography variant="h2" className="font-bold">{pointsBalance.toLocaleString()}</Typography>
                            <Typography variant="h6" className="text-slate-400">PTS</Typography>
                        </div>
                        <div className="mt-4 max-w-md">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Member</span>
                                <span>Gold Status ({nextTier.toLocaleString()} pts)</span>
                            </div>
                            <LinearProgress variant="determinate" value={progress} className="rounded-full h-2 bg-slate-700" sx={{ '& .MuiLinearProgress-bar': { backgroundColor: '#fbbf24' } }} />
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <EmojiEvents className="text-yellow-400" />
                            <Typography variant="subtitle1" className="font-bold">Next Reward</Typography>
                        </div>
                        <Typography variant="body2" className="text-slate-300">Earn 5,000 more points to unlock priority access.</Typography>
                    </div>
                </div>
            </div>

            <Typography variant="h5" className="font-bold mb-6 text-slate-900">Redeem Rewards</Typography>
            <Grid container spacing={3} className="mb-12">
                {catalog.map(reward => (
                    <Grid size={{ xs: 12, md: 4 }} key={reward.id}>
                        <Paper className={`p-6 rounded-xl border transition-all h-full flex flex-col ${reward.redeemed ? 'bg-slate-50 border-slate-200 opacity-70' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
                            <div className="mb-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                    <CardGiftcard />
                                </div>
                                <Typography variant="h6" className="font-bold mb-2">{reward.title}</Typography>
                                <Typography variant="body2" className="text-slate-500">{reward.description}</Typography>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="font-bold text-slate-900">{reward.cost.toLocaleString()} pts</span>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={reward.redeemed || pointsBalance < reward.cost}
                                    onClick={() => handleRedeem(reward.id, reward.title)}
                                >
                                    {reward.redeemed ? 'Redeemed' : 'Redeem'}
                                </Button>
                            </div>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h5" className="font-bold mb-6 text-slate-900">History</Typography>
            <Paper className="rounded-xl border border-slate-200 overflow-hidden">
                {history.map((item, i) => (
                    <div key={item.id} className={`p-4 flex justify-between items-center ${i !== history.length - 1 ? 'border-b border-slate-100' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${item.points > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                <History fontSize="small" />
                            </div>
                            <div>
                                <Typography variant="subtitle2" className="font-semibold">{item.action}</Typography>
                                <Typography variant="caption" className="text-slate-500">{item.date}</Typography>
                            </div>
                        </div>
                        <span className={`font-mono font-bold ${item.points > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                            {item.points > 0 ? '+' : ''}{item.points}
                        </span>
                    </div>
                ))}
            </Paper>
        </AccountShell>
    );
};

export default LoyaltyPage;
