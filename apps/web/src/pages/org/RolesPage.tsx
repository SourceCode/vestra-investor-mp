import { InfoOutlined } from '@mui/icons-material';
import { Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import React from 'react';

const PERMISSIONS = [
    { admin: true, agent: true, category: 'Deals', investor: true, label: 'View Published Deals' },
    { admin: true, agent: true, category: 'Deals', investor: false, label: 'Create/Edit Deals' },
    { admin: true, agent: false, category: 'Deals', investor: false, label: 'Archive Deals' },
    { admin: true, agent: false, category: 'Offers', investor: true, label: 'Submit Offers' },
    { admin: true, agent: true, category: 'Offers', investor: false, label: 'Accept/Reject Offers' },
    { admin: true, agent: false, category: 'Organization', investor: false, label: 'Manage Users' },
    { admin: true, agent: false, category: 'Organization', investor: false, label: 'Edit Branding' },
    { admin: true, agent: true, category: 'Finance', investor: false, label: 'View Closings' }, // Investor sees own only
];

const RolesPage: React.FC = () => {
    return (
        <div>
            <div className="mb-8">
                <Typography variant="h4" className="font-bold text-slate-900 mb-2">Roles & Permissions</Typography>
                <Typography className="text-slate-500">Overview of system roles and their capabilities. Custom roles coming soon.</Typography>
            </div>

            <Paper className="rounded-xl border border-slate-200 overflow-hidden">
                <TableContainer>
                    <Table>
                        <TableHead className="bg-slate-50">
                            <TableRow>
                                <TableCell className="font-bold text-slate-500 w-1/3">Permission</TableCell>
                                <TableCell align="center" className="font-bold text-slate-900">Owner / Admin</TableCell>
                                <TableCell align="center" className="font-bold text-slate-900">Agent</TableCell>
                                <TableCell align="center" className="font-bold text-slate-900">Investor</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {PERMISSIONS.map((perm, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24">{perm.category}</span>
                                            <span className="font-medium text-slate-700">{perm.label}</span>
                                            <Tooltip title="System defined permission"><InfoOutlined fontSize="small" className="text-slate-300 w-4 h-4" /></Tooltip>
                                        </div>
                                    </TableCell>
                                    <TableCell align="center"><Checkbox checked={perm.admin} disabled size="small" /></TableCell>
                                    <TableCell align="center"><Checkbox checked={perm.agent} disabled size="small" /></TableCell>
                                    <TableCell align="center"><Checkbox checked={perm.investor} disabled size="small" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
};

export default RolesPage;
