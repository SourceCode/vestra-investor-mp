import React, { useState, useEffect, useRef } from 'react';
import { trpc } from '../../utils/trpc';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Stack,
    CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, currentUserId }) => {
    const [messageContent, setMessageContent] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const utils = trpc.useContext();

    // Polling for new messages every 3 seconds for now (simple real-time)
    const { data: messages, isLoading } = trpc.messaging.getMessages.useQuery(
        { conversationId },
        { refetchInterval: 3000 }
    );

    const sendMessageMutation = trpc.messaging.sendMessage.useMutation({
        onSuccess: () => {
            setMessageContent('');
            utils.messaging.getMessages.invalidate({ conversationId });
            utils.messaging.getConversations.invalidate(); // Update list for last message/order
        }
    });

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = () => {
        if (!messageContent.trim()) return;
        sendMessageMutation.mutate({
            conversationId,
            senderId: currentUserId,
            content: messageContent
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (isLoading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
    if (!messages) return <Typography p={4}>Messages not found.</Typography>;

    return (
        <Box display="flex" flexDirection="column" height="100%">
            {/* Messages Area */}
            <Box flex={1} overflow="auto" p={2} bgcolor="#f5f5f5">
                <Stack spacing={2}>
                    {messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <Box
                                key={msg.id}
                                alignSelf={isMe ? 'flex-end' : 'flex-start'}
                                maxWidth="70%"
                            >
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1.5,
                                        bgcolor: isMe ? 'primary.main' : 'background.paper',
                                        color: isMe ? 'primary.contrastText' : 'text.primary',
                                        borderRadius: 2
                                    }}
                                >
                                    <Typography variant="body1">{msg.content}</Typography>
                                    <Typography variant="caption" display="block" textAlign="right" sx={{ opacity: 0.7, mt: 0.5 }}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Paper>
                            </Box>
                        );
                    })}
                    <div ref={bottomRef} />
                </Stack>
            </Box>

            {/* Input Area */}
            <Box p={2} bgcolor="background.paper" borderTop={1} borderColor="divider">
                <Stack direction="row" spacing={1}>
                    <TextField
                        fullWidth
                        placeholder="Type a message..."
                        variant="outlined"
                        size="small"
                        multiline
                        maxRows={4}
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sendMessageMutation.isPending}
                    />
                    <Button
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={handleSend}
                        disabled={!messageContent.trim() || sendMessageMutation.isPending}
                    >
                        Send
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};
