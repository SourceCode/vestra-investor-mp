import React, { useEffect, useState } from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, InputAdornment, IconButton, Chip } from '@mui/material';
import { Add, Search, Edit, Visibility, FilterList, MoreVert } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, fetchProperties } from '../../store';
import { useNavigate } from 'react-router-dom';
import DealStatusChip from '../../components/DealStatusChip';

const AgentDealsPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: deals, loading } = useSelector((state: RootState) => state.properties);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchProperties({} as any));
    }, [dispatch]);

    const filteredDeals = deals.filter(d => 
        d.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Typography variant="h4" className="font-bold">Deals</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => navigate('/agent/deals/new')}
                    className="bg-slate-900"
                >
                    Add Property
                </Button>
            </div>

            <Paper className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center gap-4">
                    <TextField 
                        placeholder="Search addresses..." 
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search className="text-slate-400"/></InputAdornment>
                        }}
                        className="w-full max-w-md"
                    />
                    <div className="flex gap-2">
                        <Button startIcon={<FilterList />} color="inherit">Filters</Button>
                    </div>
                </div>

                <TableContainer>
                    <Table>
                        <TableHead className="bg-slate-50">
                            <TableRow>
                                <TableCell className="font-bold text-slate-500">Property</TableCell>
                                <TableCell className="font-bold text-slate-500">Status</TableCell>
                                <TableCell className="font-bold text-slate-500">Price</TableCell>
                                <TableCell className="font-bold text-slate-500">Metrics</TableCell>
                                <TableCell className="font-bold text-slate-500 text-right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center" className="py-8">Loading deals...</TableCell></TableRow>
                            ) : filteredDeals.length === 0 ? (
                                <TableRow><TableCell colSpan={5} align="center" className="py-8 text-slate-500">No deals found.</TableCell></TableRow>
                            ) : (
                                filteredDeals.map(deal => (
                                    <TableRow key={deal.id} hover className="cursor-pointer" onClick={() => navigate(`/agent/deals/${deal.id}/edit`)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img src={deal.image} alt="" className="w-12 h-12 rounded object-cover bg-slate-100" />
                                                <div>
                                                    <div className="font-semibold text-slate-900">{deal.address}</div>
                                                    <div className="text-xs text-slate-500">{deal.city}, {deal.state}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DealStatusChip status={deal.status} />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            ${deal.price.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs space-y-1">
                                                <div className="text-emerald-600 font-semibold">{deal.metrics.projectedRoi}% ROI</div>
                                                <div className="text-slate-500">ARV: ${(deal.metrics.arv/1000).toFixed(0)}k</div>
                                            </div>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/property/${deal.id}`); }}>
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/agent/deals/${deal.id}/edit`); }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
};

export default AgentDealsPage;
