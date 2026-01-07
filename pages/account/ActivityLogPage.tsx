import React, { useEffect } from 'react';
import AccountShell from '../../components/AccountShell';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, fetchAuditLogsRequest } from '../../store';

const ActivityLogPage: React.FC = () => {
    const dispatch = useDispatch();
    const { logs, loading } = useSelector((state: RootState) => state.audit);

    useEffect(() => {
        dispatch(fetchAuditLogsRequest());
    }, [dispatch]);

    return (
        <AccountShell title="Account Activity">
            <div className="mb-6">
                <Typography variant="body2" className="text-slate-500">
                    A secure log of important actions taken on your account.
                </Typography>
            </div>

            <Paper className="rounded-xl border border-slate-200 overflow-hidden">
                <TableContainer>
                    <Table>
                        <TableHead className="bg-slate-50">
                            <TableRow>
                                <TableCell className="font-bold text-slate-500">Action</TableCell>
                                <TableCell className="font-bold text-slate-500">Target</TableCell>
                                <TableCell className="font-bold text-slate-500">Date & Time</TableCell>
                                <TableCell className="font-bold text-slate-500 text-right">IP Address</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} align="center" className="py-8">Loading...</TableCell></TableRow>
                            ) : (
                                logs.map(log => (
                                    <TableRow key={log.id} hover>
                                        <TableCell>
                                            <Chip label={log.action} size="small" variant="outlined" className="font-mono text-xs" />
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-700">{log.target}</TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right" className="font-mono text-xs text-slate-400">
                                            {log.ip}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </AccountShell>
    );
};

export default ActivityLogPage;
