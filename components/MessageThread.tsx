import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, Paper, IconButton } from '@mui/material';
import { Send, AttachFile, MoreVert } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, sendMessageRequest, fetchMessagesRequest } from '../store';
import { useToast } from '../contexts/ToastContext';

interface MessageThreadProps {
    conversationId: string;
}

const MessageThread: React.FC<MessageThreadProps> = ({ conversationId }) => {
    const dispatch = useDispatch();
    const { messagesByConversation, conversations } = useSelector((state: RootState) => state.messaging);
    const { user } = useSelector((state: RootState) => state.auth);
    const messages = messagesByConversation[conversationId] || [];
    const conversation = conversations.find(c => c.id === conversationId);
    
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchMessagesRequest(conversationId));
    }, [conversationId, dispatch]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim()) return;
        dispatch(sendMessageRequest({ conversationId, body: newMessage }));
        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!conversation) return <div className="p-8 text-center">Select a conversation</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <Paper elevation={0} className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <img src={conversation.propertyImage} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-200" />
                    <div>
                        <Typography variant="subtitle2" className="font-bold leading-tight">{conversation.propertyAddress}</Typography>
                        <Typography variant="caption" className="text-slate-500">Deal ID: #{conversation.dealId}</Typography>
                    </div>
                </div>
                <IconButton size="small"><MoreVert /></IconButton>
            </Paper>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, index) => {
                    const isMe = msg.senderRole === user?.role; // Simplified logic
                    const isSystem = msg.senderRole === 'SYSTEM';

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <span className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full border border-slate-200">
                                    {msg.body}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                isMe 
                                ? 'bg-slate-900 text-white rounded-br-none' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                            }`}>
                                <Typography variant="body2">{msg.body}</Typography>
                                <Typography variant="caption" className={`text-[10px] block mt-1 ${isMe ? 'text-slate-400 text-right' : 'text-slate-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <div className="flex gap-2 items-end">
                    <IconButton className="mb-1 text-slate-400"><AttachFile /></IconButton>
                    <TextField 
                        fullWidth 
                        multiline 
                        maxRows={4} 
                        placeholder="Type a message..." 
                        variant="outlined" 
                        size="small"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        sx={{ 
                            '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: '#f8fafc' } 
                        }}
                    />
                    <IconButton 
                        color="primary" 
                        className="mb-1 bg-slate-900 text-white hover:bg-slate-800" 
                        onClick={handleSend}
                    >
                        <Send fontSize="small" />
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default MessageThread;
