import { Avatar, Button, Grid, Paper, TextField } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

import AccountShell from '../../components/AccountShell';
import { RootState } from '../../store';

const ProfilePage: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <AccountShell title="My Profile">
            <Paper className="p-8 rounded-xl border border-slate-200">
                <div className="flex items-center gap-6 mb-8">
                    <Avatar sx={{ bgcolor: '#0f172a', fontSize: '2rem', height: 80, width: 80 }}>
                        {user?.firstName?.[0]}
                    </Avatar>
                    <Button variant="outlined" size="small">Change Avatar</Button>
                </div>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="First Name" fullWidth defaultValue={user?.firstName} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="Last Name" fullWidth defaultValue={user?.lastName} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="Email" fullWidth defaultValue={user?.email} disabled />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="Phone" fullWidth defaultValue={user?.phone} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField label="Company" fullWidth defaultValue={user?.company} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Button variant="contained">Save Changes</Button>
                    </Grid>
                </Grid>
            </Paper>
        </AccountShell>
    );
};

export default ProfilePage;
