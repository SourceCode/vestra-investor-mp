import React from 'react';
import AccountShell from '../../components/AccountShell';
import { Grid, Typography, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import PropertyCard from '../../components/PropertyCard';
import { MOCK_PROPERTIES } from '../../constants';
import { useNavigate } from 'react-router-dom';

const SavedDealsPage: React.FC = () => {
    const navigate = useNavigate();
    const { savedIds } = useSelector((state: RootState) => state.saved);
    const savedProperties = MOCK_PROPERTIES.filter(p => savedIds.includes(p.id));

    return (
        <AccountShell title="Saved Deals">
            {savedProperties.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
                    <Typography variant="h6" className="text-slate-400 mb-4">No saved deals yet.</Typography>
                    <Button variant="outlined" onClick={() => navigate('/browse')}>Browse Properties</Button>
                </div>
            ) : (
                <Grid container spacing={3}>
                    {savedProperties.map(prop => (
                        <Grid item xs={12} md={6} lg={4} key={prop.id}>
                            <PropertyCard property={prop} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </AccountShell>
    );
};

export default SavedDealsPage;
