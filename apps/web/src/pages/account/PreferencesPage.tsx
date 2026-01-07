import { Button, Chip, Paper, Slider, Typography } from '@mui/material';
import React from 'react';

import AccountShell from '../../components/AccountShell';

const PreferencesPage: React.FC = () => {
    return (
        <AccountShell title="Investing Criteria">
             <Paper className="p-8 rounded-xl border border-slate-200 space-y-8">
                <div>
                    <Typography gutterBottom className="font-semibold">Budget Range</Typography>
                    <Slider 
                        defaultValue={[100000, 1000000]}
                        min={50000} max={5000000} step={50000} valueLabelDisplay="auto"
                        className="max-w-md"
                    />
                </div>
                <div>
                    <Typography gutterBottom className="font-semibold mb-3">Strategies</Typography>
                    <div className="flex gap-2">
                        {['Fix & Flip', 'Buy & Hold', 'BRRRR', 'Wholesale'].map(s => (
                            <Chip key={s} label={s} variant={s === 'Fix & Flip' ? 'filled' : 'outlined'} color={s === 'Fix & Flip' ? 'primary' : 'default'} onClick={()=>{}} />
                        ))}
                    </div>
                </div>
                 <div>
                    <Typography gutterBottom className="font-semibold mb-3">Target Markets</Typography>
                    <div className="flex gap-2">
                        {['Los Angeles', 'Austin', 'Phoenix'].map(s => (
                            <Chip key={s} label={s} onDelete={()=>{}} />
                        ))}
                        <Chip label="+ Add Market" variant="outlined" onClick={()=>{}} />
                    </div>
                </div>
                <Button variant="contained">Update Criteria</Button>
             </Paper>
        </AccountShell>
    );
};

export default PreferencesPage;
