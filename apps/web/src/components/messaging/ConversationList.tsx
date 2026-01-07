import React from 'react';
import { trpc } from '../../utils/trpc';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Paper,
    Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';

interface ConversationListProps {
    currentUserId: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({ currentUserId }) => {
    const navigate = useNavigate();
    const { id: selectedId } = useParams();
    const { data: conversations, isLoading } = trpc.messaging.getConversations.useQuery({ userId: currentUserId });

    if (isLoading) {
        return <Typography p={2}>Loading conversations...</Typography>;
    }

    if (!conversations || conversations.length === 0) {
        return <Typography p={2}>No conversations yet.</Typography>;
    }

    return (
        <Paper elevation={0} sx={{ height: '100%', overflow: 'auto', borderRight: 1, borderColor: 'divider' }}>
            <List>
                {conversations.map((conv) => {
                    // Primitive logic to find the "other" participant name
                    const otherParticipant = conv.participants.find(p => p.userId !== currentUserId)?.user;
                    const displayName = otherParticipant
                        ? `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() || otherParticipant.email
                        : 'Unknown User';

                    const isSelected = conv.id === selectedId;

                    return (
                        <React.Fragment key={conv.id}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    selected={isSelected}
                                    onClick={() => navigate(`/messages/${conv.id}`)}
                                    alignItems="flex-start"
                                >
                                    <ListItemAvatar>
                                        <Avatar>
                                            <PersonIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={conv.title || displayName}
                                        secondary={
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                                noWrap
                                            >
                                                {conv.deal ? `Re: ${conv.deal.address}` : 'Direct Message'}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </React.Fragment>
                    );
                })}
            </List>
        </Paper>
    );
};
