import { Add, Delete, Edit, Mail, MoreVert } from '@mui/icons-material';
import { Avatar, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputLabel, Menu, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useToast } from '../../contexts/ToastContext';
import { fetchOrgUsersRequest, inviteUserRequest, removeUserRequest, RootState, updateUserRoleRequest } from '../../store';
import { OrgUser } from '../../types';

const UsersPage: React.FC = () => {
    const dispatch = useDispatch();
    const { loading, users } = useSelector((state: RootState) => state.organization);
    const { showToast } = useToast();

    // Invite Dialog State
    const [openInvite, setOpenInvite] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', role: 'AGENT' });

    // Menu State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null);

    // Edit Role Dialog State
    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [newRole, setNewRole] = useState('');

    // Delete Confirmation State
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: OrgUser) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const openEditRole = () => {
        if (selectedUser) {
            setNewRole(selectedUser.role);
            setOpenRoleDialog(true);
            setAnchorEl(null); // Close menu, keep selectedUser
        }
    };

    const openDeleteConfirm = () => {
        setOpenDeleteDialog(true);
        setAnchorEl(null); // Close menu, keep selectedUser
    };

    const handleUpdateRole = () => {
        if (selectedUser && newRole) {
            dispatch(updateUserRoleRequest({ role: newRole, userId: selectedUser.id }));
            setOpenRoleDialog(false);
            setSelectedUser(null);
            showToast(`Role updated to ${newRole}`);
        }
    };

    const handleDeleteUser = () => {
        if (selectedUser) {
            dispatch(removeUserRequest(selectedUser.id));
            setOpenDeleteDialog(false);
            setSelectedUser(null);
            showToast('User removed from organization');
        }
    };

    const handleCloseDialogs = () => {
        setOpenRoleDialog(false);
        setOpenDeleteDialog(false);
        setSelectedUser(null);
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
                                                <Avatar sx={{ height: 32, width: 32 }}>{user.name[0]}</Avatar>
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
                                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={openEditRole}>
                    <Edit fontSize="small" className="mr-2 text-slate-500" /> Edit Role
                </MenuItem>
                <MenuItem onClick={openDeleteConfirm} className="text-red-600">
                    <Delete fontSize="small" className="mr-2" /> Remove User
                </MenuItem>
            </Menu>

            {/* Invite Dialog */}
            <Dialog open={openInvite} onClose={() => setOpenInvite(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogContent className="pt-4">
                    <div className="space-y-4 pt-2">
                        <TextField
                            label="Email Address"
                            fullWidth
                            type="email"
                            value={inviteData.email}
                            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={inviteData.role}
                                label="Role"
                                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
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

            {/* Edit Role Dialog */}
            <Dialog open={openRoleDialog} onClose={handleCloseDialogs} maxWidth="xs" fullWidth>
                <DialogTitle>Edit User Role</DialogTitle>
                <DialogContent className="pt-4">
                    <div className="pt-2">
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={newRole}
                                label="Role"
                                onChange={(e) => setNewRole(e.target.value)}
                            >
                                <MenuItem value="OWNER">Owner</MenuItem>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="AGENT">Agent</MenuItem>
                                <MenuItem value="INVESTOR">Investor</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions className="p-4">
                    <Button onClick={handleCloseDialogs}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateRole}>Update Role</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialogs} maxWidth="xs" fullWidth>
                <DialogTitle>Remove User?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove <strong>{selectedUser?.name}</strong> from the organization? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="p-4">
                    <Button onClick={handleCloseDialogs}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteUser}>Remove</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UsersPage;
