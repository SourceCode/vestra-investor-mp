import { Close } from '@mui/icons-material';
import { Avatar, Badge, Box, Drawer, IconButton, List, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchConversationsRequest, RootState, setActiveConversation, setInboxDrawerOpen } from '../store';
import MessageThread from './MessageThread';

const InboxDrawer: React.FC = () => {
    const dispatch = useDispatch();
    const { isInboxDrawerOpen } = useSelector((state: RootState) => state.ui);
    const { activeConversationId, conversations } = useSelector((state: RootState) => state.messaging);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isInboxDrawerOpen) {
            dispatch(fetchConversationsRequest());
        }
    }, [isInboxDrawerOpen, dispatch]);

    const handleSelect = (id: string) => {
        dispatch(setActiveConversation(id));
    };

    return (
        <Drawer
            anchor="right"
            open={isInboxDrawerOpen}
            onClose={() => dispatch(setInboxDrawerOpen(false))}
            PaperProps={{ sx: { display: 'flex', flexDirection: 'row', width: { md: 800, xs: '100%' } } }}
        >
            {/* Left: Conversation List */}
            <div className={`flex-col h-full border-r border-slate-200 bg-white ${activeConversationId ? 'hidden md:flex w-[320px]' : 'flex w-full'}`}>
                <div className="p-4 border-b border-slate-200 flex justify-between items-center h-16 shrink-0">
                    <Typography variant="h6" className="font-bold">Messages</Typography>
                    <IconButton onClick={() => dispatch(setInboxDrawerOpen(false))} className="md:hidden">
                        <Close />
                    </IconButton>
                </div>
                
                <List className="flex-grow overflow-y-auto p-0">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No messages yet.</div>
                    ) : (
                        conversations.map(conv => (
                            <ListItemButton 
                                key={conv.id} 
                                selected={conv.id === activeConversationId}
                                onClick={() => handleSelect(conv.id)}
                                className="border-b border-slate-50 hover:bg-slate-50"
                                alignItems="flex-start"
                            >
                                <ListItemAvatar>
                                    <Badge color="error" variant="dot" invisible={conv.unreadCount === 0}>
                                        <Avatar src={conv.propertyImage} variant="rounded" />
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-sm truncate w-24">{conv.propertyAddress}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(conv.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    }
                                    secondary={
                                        <Typography variant="body2" className="text-slate-500 text-xs truncate block mt-0.5">
                                            {conv.lastMessage}
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        ))
                    )}
                </List>
            </div>

            {/* Right: Active Thread */}
            <div className={`flex-col flex-grow h-full bg-slate-50 ${activeConversationId ? 'flex' : 'hidden md:flex'}`}>
                {activeConversationId ? (
                    <div className="h-full relative flex flex-col">
                        <div className="absolute top-2 right-2 z-20 md:hidden">
                            <IconButton onClick={() => dispatch(setActiveConversation(null))} className="bg-white shadow">
                                <Close fontSize="small" />
                            </IconButton>
                        </div>
                        <MessageThread conversationId={activeConversationId} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
            
            {/* Desktop Close Button Absolute */}
            <div className="absolute top-4 right-4 hidden md:block z-50">
                 <IconButton onClick={() => dispatch(setInboxDrawerOpen(false))} className="bg-white/80 hover:bg-white shadow-sm">
                     <Close />
                 </IconButton>
            </div>
        </Drawer>
    );
};

export default InboxDrawer;
