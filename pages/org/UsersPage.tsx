import React, { useEffect, useState } from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Avatar, Chip, IconButton, Dialog, DialogTitle, DialogContent, TextField, MenuItem, Select, FormControl, InputLabel, DialogActions } from '@mui/material';
import { Add, MoreVert, Mail } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, fetchOrgUsersRequest, inviteUserRequest } from '../../store';
import { useToast } from '../../contexts/ToastContext';

const UsersPage: React.FC = () => {
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state: RootState) => state.organization);
    const { showToast } = useToast();
    
    const [openInvite, setOpenInvite] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', role: 'AGENT' });

    useEffect(() => {
        dispatch(fetchOrgUsersRequest());
    }, [dispatch]);

    const handleInvite = () => {
        if (!inviteData.email) return;
        dispatch(inviteUserRequest(inviteData));
        setOpenInvite(false);
        setInviteData({ email: '', role: 'AGENT' });
        showToast(`Invitation sent to ${inviteData.email}`);
    };

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="font-bold text-slate-900 mb-2">Team Members</Typography>
                    <Typography className="text-slate-500">Manage access and roles for your organization.</Typography>
                </div>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenInvite(true)}>Invite User</Button>
            </div>

            <Paper className="rounded-xl border border-slate-200 overflow-hidden">
                <TableContainer>
                    <Table>
                        <TableHead className="bg-slate-50">
                            <TableRow>
                                <TableCell className="font-bold text-slate-500">Name</TableCell>
                                <TableCell className="font-bold text-slate-500">Role</TableCell>
                                <TableCell className="font-bold text-slate-500">Status</TableCell>
                                <TableCell className="font-bold text-slate-500">Last Active</TableCell>
                                <TableCell className="font-bold text-slate-500 text-right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center" className="py-8">Loading users...</TableCell></TableRow>
                            ) : (
                                users.map(user => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar sx={{ width: 32, height: 32 }}>{user.name[0]}</Avatar>
                                                <div>
                                                    <Typography variant="subtitle2" className="font-semibold text-slate-900">{user.name}</Typography>
                                                    <Typography variant="caption" className="text-slate-500">{user.email}</Typography>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={user.role} 
                                                size="small" 
                                                color={user.role === 'OWNER' ? 'primary' : 'default'} 
                                                className="font-semibold"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-600' : 'bg-yellow-600'}`}></span>
                                                {user.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">{user.lastActive}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small"><MoreVert /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openInvite} onClose={() => setOpenInvite(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogContent className="pt-4">
                    <div className="space-y-4 pt-2">
                        <TextField 
                            label="Email Address" 
                            fullWidth 
                            type="email"
                            value={inviteData.email}
                            onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select 
                                value={inviteData.role}
                                label="Role"
                                onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                            >
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="AGENT">Agent</MenuItem>
                                <MenuItem value="INVESTOR">Investor (Client)</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions className="p-4">
                    <Button onClick={() => setOpenInvite(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleInvite} startIcon={<Mail />}>Send Invite</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UsersPage;
