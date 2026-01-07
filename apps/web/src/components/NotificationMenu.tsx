import { AccessTime, CheckCircle, LocalOffer, MonetizationOn, Notifications } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, Divider, Menu, MenuItem, Typography, CircularProgress } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { trpc } from '../utils/trpc';
import { Notification } from '../types';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface NotificationMenuProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
    open: boolean;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ anchorEl, onClose, open }) => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const utils = trpc.useContext();

    // Skip query if no user (though this menu shouldn't be open if no user)
    const { data: notifications, isLoading } = trpc.notification.list.useQuery(
        { userId: user?.id! },
        {
            enabled: !!user?.id && open,
            refetchInterval: 10000 // Poll every 10s while open
        }
    );

    const markReadMutation = trpc.notification.markRead.useMutation({
        onSuccess: () => {
            utils.notification.unreadCount.invalidate();
            utils.notification.list.invalidate();
        }
    });

    const markAllReadMutation = trpc.notification.markAllRead.useMutation({
        onSuccess: () => {
            utils.notification.unreadCount.invalidate();
            utils.notification.list.invalidate();
        }
    });

    const handleItemClick = (notification: Notification) => {
        if (!notification.isRead) {
            markReadMutation.mutate({ id: notification.id });
        }
        onClose();
        if (notification.link) navigate(notification.link);
    };

    const handleMarkAllRead = () => {
        if (user?.id) {
            markAllReadMutation.mutate({ userId: user.id });
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'OFFER_STATUS': return <MonetizationOn className="text-emerald-500" fontSize="small" />;
            case 'DEAL_STATUS': return <AccessTime className="text-blue-500" fontSize="small" />;
            case 'ACCESS_APPROVED': return <CheckCircle className="text-teal-500" fontSize="small" />;
            case 'BID_ALERT': return <LocalOffer className="text-orange-500" fontSize="small" />;
            default: return <Notifications className="text-slate-400" fontSize="small" />;
        }
    };

    const list = notifications || [];

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            PaperProps={{
                elevation: 4,
                sx: {
                    borderRadius: 3,
                    maxHeight: 480,
                    mt: 1.5,
                    overflowX: 'hidden',
                    width: 360
                }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <Typography variant="subtitle2" className="font-bold text-slate-900">Notifications</Typography>
                <Box>
                    <Button size="small" className="text-xs" onClick={handleMarkAllRead} disabled={list.length === 0 || markAllReadMutation.isPending}>
                        Mark all read
                    </Button>
                </Box>
            </div>

            {isLoading ? (
                <div className="p-8 text-center">
                    <CircularProgress size={24} />
                </div>
            ) : list.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                    <Notifications className="text-slate-200 text-4xl mb-2" />
                    <Typography variant="body2">No notifications yet</Typography>
                </div>
            ) : (
                list.map(item => (
                    <MenuItem
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`py-3 px-4 items-start gap-3 border-b border-slate-50 last:border-0 ${!item.isRead ? 'bg-blue-50/50' : ''}`}
                    >
                        <div className="mt-1 shrink-0 bg-white p-1 rounded-full shadow-sm border border-slate-100">
                            {getIcon(item.type)}
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                                <Typography variant="subtitle2" className="font-semibold text-sm truncate pr-2">
                                    {item.title}
                                </Typography>
                                <Typography variant="caption" className="text-slate-400 text-[10px] whitespace-nowrap">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </Typography>
                            </div>
                            <Typography variant="body2" className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                                {item.body}
                            </Typography>
                        </div>
                        {!item.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>}
                    </MenuItem>
                ))
            )}

            <div className="p-2 border-t border-slate-100 text-center sticky bottom-0 bg-white">
                <Button fullWidth size="small" onClick={() => { onClose(); navigate('/notifications'); }}>
                    View All Activity
                </Button>
            </div>
        </Menu>
    );
};

export default NotificationMenu;
