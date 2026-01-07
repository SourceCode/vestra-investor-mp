import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ConversationList } from '../components/messaging/ConversationList';
import { ChatWindow } from '../components/messaging/ChatWindow';

export const MessagesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useSelector((state: RootState) => state.auth);
    const currentUserId = user?.id;

    if (!currentUserId) {
        return <Typography p={4}>Please log in to view messages.</Typography>;
    }

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', p: 2 }}>
            <Paper elevation={3} sx={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
                <Grid container sx={{ height: '100%' }}>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', borderRight: 1, borderColor: 'divider' }}>
                        <ConversationList currentUserId={currentUserId} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%' }}>
                        {id ? (
                            <ChatWindow conversationId={id} currentUserId={currentUserId} />
                        ) : (
                            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                <Typography variant="h6" color="text.secondary">
                                    Select a conversation to start messaging
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};
