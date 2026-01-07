import React from 'react';
import { Menu, MenuItem, Typography, Button, Divider, Badge, Box, Avatar } from '@mui/material';
import { Notifications, CheckCircle, MonetizationOn, AccessTime, LocalOffer } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, markReadRequest } from '../store';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../types';

interface NotificationMenuProps {
    anchorEl: null | HTMLElement;
    open: boolean;
    onClose: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ anchorEl, open, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { list } = useSelector((state: RootState) => state.notifications);

    const handleItemClick = (notification: Notification) => {
        dispatch(markReadRequest(notification.id));
        onClose();
        if (notification.link) navigate(notification.link);
    };

    const getIcon = (type: Notification['type']) => {
        switch(type) {
            case 'OFFER_STATUS': return <MonetizationOn className="text-emerald-500" fontSize="small"/>;
            case 'DEAL_STATUS': return <AccessTime className="text-blue-500" fontSize="small"/>;
            case 'ACCESS_APPROVED': return <CheckCircle className="text-teal-500" fontSize="small"/>;
            case 'BID_ALERT': return <LocalOffer className="text-orange-500" fontSize="small"/>;
            default: return <Notifications className="text-slate-400" fontSize="small"/>;
        }
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            PaperProps={{ 
                elevation: 4, 
                sx: { 
                    mt: 1.5, 
                    width: 360, 
                    maxHeight: 480, 
                    borderRadius: 3,
                    overflowX: 'hidden'
                } 
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <Typography variant="subtitle2" className="font-bold text-slate-900">Notifications</Typography>
                <Button size="small" className="text-xs" onClick={() => navigate('/notifications')}>View All</Button>
            </div>
            
            {list.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                    <Notifications className="text-slate-200 text-4xl mb-2" />
                    <Typography variant="body2">No notifications yet</Typography>
                </div>
            ) : (
                list.slice(0, 5).map(item => (
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
                     Open Notification Center
                 </Button>
            </div>
        </Menu>
    );
};

export default NotificationMenu;
