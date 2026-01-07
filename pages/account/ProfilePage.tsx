import React from 'react';
import AccountShell from '../../components/AccountShell';
import { Paper, Grid, TextField, Button, Avatar } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const ProfilePage: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <AccountShell title="My Profile">
            <Paper className="p-8 rounded-xl border border-slate-200">
                <div className="flex items-center gap-6 mb-8">
                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#0f172a', fontSize: '2rem' }}>
                        {user?.firstName?.[0]}
                    </Avatar>
                    <Button variant="outlined" size="small">Change Avatar</Button>
                </div>
                
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <TextField label="First Name" fullWidth defaultValue={user?.firstName} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                         <TextField label="Last Name" fullWidth defaultValue={user?.lastName} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                         <TextField label="Email" fullWidth defaultValue={user?.email} disabled />
                    </Grid>
                    <Grid item xs={12} md={6}>
                         <TextField label="Phone" fullWidth defaultValue={user?.phone} />
                    </Grid>
                    <Grid item xs={12}>
                         <TextField label="Company" fullWidth defaultValue={user?.company} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained">Save Changes</Button>
                    </Grid>
                </Grid>
            </Paper>
        </AccountShell>
    );
};

export default ProfilePage;
