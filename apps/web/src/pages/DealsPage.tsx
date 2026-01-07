import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Button, Typography, Chip, Switch, FormControlLabel } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { RootState, fetchDealsRequest } from '../store';
import { Deal } from '../types';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';

const columns: GridColDef[] = [
    {
        field: 'title',
        headerName: 'Title',
        flex: 1,
        valueGetter: (value: string, row: any) => value || row.address || 'Untitled'
    },
    { field: 'address', headerName: 'Address', flex: 1.5 },
    {
        field: 'price',
        headerName: 'Price',
        width: 150,
        valueFormatter: (value: number) => {
            if (value == null) return '';
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        }
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params: GridRenderCellParams) => {
            const statusColors: Record<string, "default" | "primary" | "secondary" | "success" | "error" | "info" | "warning"> = {
                DRAFT: 'default',
                LEAD: 'info',
                ANALYSIS: 'primary',
                OFFER: 'warning',
                UNDER_CONTRACT: 'secondary',
                CLOSED: 'success',
                ARCHIVED: 'default'
            };
            return <Chip label={params.value as string} color={statusColors[params.value as string] || 'default'} size="small" />;
        }
    },
    {
        field: 'updatedAt',
        headerName: 'Last Updated',
        width: 200,
        type: 'dateTime',
        valueGetter: (value: string) => value && new Date(value)
    },
];

export const DealsPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: mockList, loading: mockLoading } = useSelector((state: RootState) => state.deals);

    // Feature Flag / Toggle for Real Data
    const [useRealData, setUseRealData] = React.useState(false);

    // tRPC Query
    const { data: realList, isLoading: realLoading } = trpc.marketplace.getListings.useQuery(undefined, {
        enabled: useRealData,
    });

    useEffect(() => {
        if (!useRealData) {
            dispatch(fetchDealsRequest());
        }
    }, [dispatch, useRealData]);

    const handleCreate = () => {
        navigate('/deals/new');
    };

    const rows = useRealData ? (realList || []) : mockList;
    const loading = useRealData ? realLoading : mockLoading;

    return (
        <Box sx={{ height: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4">Deals</Typography>
                    <FormControlLabel
                        control={<Switch checked={useRealData} onChange={(e) => setUseRealData(e.target.checked)} />}
                        label="Real Data (Marketplace)"
                    />
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    New Deal
                </Button>
            </Box>

            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                autoHeight
                disableRowSelectionOnClick
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[5, 10, 25]}
            />
        </Box>
    );
};
