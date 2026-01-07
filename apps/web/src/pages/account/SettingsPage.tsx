import { Divider, FormControlLabel, Paper, Switch, Typography } from '@mui/material';
import React from 'react';

import AccountShell from '../../components/AccountShell';

const SettingsPage: React.FC = () => {
    return (
        <AccountShell title="Settings">
             <Paper className="rounded-xl border border-slate-200 overflow-hidden">
                 <div className="p-6">
                    <Typography variant="h6" className="font-bold mb-4">Notifications</Typography>
                    <div className="flex flex-col gap-2">
                        <FormControlLabel control={<Switch defaultChecked />} label="Email notifications for new matches" />
                        <FormControlLabel control={<Switch defaultChecked />} label="In-app notifications for status updates" />
                        <FormControlLabel control={<Switch />} label="Marketing emails" />
                    </div>
                 </div>
                 <Divider />
                 <div className="p-6">
                    <Typography variant="h6" className="font-bold mb-4">Appearance</Typography>
                    <div className="flex gap-4">
                        <div className="w-24 h-16 bg-white border-2 border-slate-900 rounded cursor-pointer flex items-center justify-center font-bold text-xs">Light</div>
                        <div className="w-24 h-16 bg-slate-900 border border-slate-200 rounded opacity-50 cursor-not-allowed flex items-center justify-center text-white font-bold text-xs">Dark</div>
                    </div>
                 </div>
             </Paper>
        </AccountShell>
    );
};

export default SettingsPage;
