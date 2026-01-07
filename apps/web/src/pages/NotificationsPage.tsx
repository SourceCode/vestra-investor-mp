import { AccessTime, CheckCircle, LocalOffer, MonetizationOn, Notifications } from '@mui/icons-material';
import { Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import AccountShell from '../components/AccountShell';
import { markReadRequest, RootState } from '../store';
import { Notification } from '../types';

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { list } = useSelector((state: RootState) => state.notifications);

    const handleItemClick = (notification: Notification) => {
        dispatch(markReadRequest(notification.id));
        if (notification.link) navigate(notification.link);
    };

    const getIcon = (type: Notification['type']) => {
        switch(type) {
            case 'OFFER_STATUS': return <MonetizationOn className="text-emerald-500"/>;
            case 'DEAL_STATUS': return <AccessTime className="text-blue-500"/>;
            case 'ACCESS_APPROVED': return <CheckCircle className="text-teal-500"/>;
            case 'BID_ALERT': return <LocalOffer className="text-orange-500"/>;
            default: return <Notifications className="text-slate-400"/>;
        }
    };

    return (
        <AccountShell title="Notifications">
            <Paper className="rounded-xl border border-slate-200 overflow-hidden">
                {list.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Typography variant="h6">All caught up!</Typography>
                        <Typography>No new notifications.</Typography>
                    </div>
                ) : (
                    <List disablePadding>
                        {list.map(item => (
                            <ListItemButton 
                                key={item.id} 
                                onClick={() => handleItemClick(item)} 
                                className={`border-b border-slate-100 py-4 ${!item.isRead ? 'bg-blue-50/40' : ''}`}
                            >
                                <ListItemIcon className="min-w-[48px]">
                                    <div className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
                                        {getIcon(item.type)}
                                    </div>
                                </ListItemIcon>
                                <ListItemText 
                                    primary={
                                        <div className="flex justify-between">
                                            <span className={`font-semibold ${!item.isRead ? 'text-slate-900' : 'text-slate-700'}`}>{item.title}</span>
                                            <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                                        </div>
                                    }
                                    secondary={
                                        <span className="block mt-1 text-slate-600">{item.body}</span>
                                    }
                                />
                                {!item.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 ml-4"></div>}
                            </ListItemButton>
                        ))}
                    </List>
                )}
            </Paper>
        </AccountShell>
    );
};

export default NotificationsPage;
