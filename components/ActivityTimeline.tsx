import React from 'react';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { Typography, Paper } from '@mui/material';
import { Description, Gavel, MonetizationOn, Update } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ActivityEvent } from '../types';

const ActivityTimeline: React.FC = () => {
    const { list } = useSelector((state: RootState) => state.activity);

    const getIcon = (type: ActivityEvent['type']) => {
        switch(type) {
            case 'OFFER': return <MonetizationOn fontSize="small" />;
            case 'CONTRACT': return <Gavel fontSize="small" />;
            case 'STATUS_CHANGE': return <Update fontSize="small" />;
            default: return <Description fontSize="small" />;
        }
    };

    const getColor = (type: ActivityEvent['type']) => {
        switch(type) {
            case 'OFFER': return 'warning';
            case 'CONTRACT': return 'success';
            case 'STATUS_CHANGE': return 'info';
            default: return 'grey';
        }
    };

    if (list.length === 0) return <Typography className="text-slate-500 italic">No activity yet.</Typography>;

    return (
        <Timeline position="right" sx={{ padding: 0, margin: 0 }}>
            {list.map((item) => (
                <TimelineItem key={item.id} sx={{ '&:before': { display: 'none' } }}>
                    <TimelineSeparator>
                        <TimelineDot color={getColor(item.type)} variant="outlined">
                            {getIcon(item.type)}
                        </TimelineDot>
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="subtitle2" component="span" className="font-semibold block">
                            {item.description}
                        </Typography>
                        <Typography variant="caption" className="text-slate-500">
                            {new Date(item.timestamp).toLocaleString()}
                        </Typography>
                    </TimelineContent>
                </TimelineItem>
            ))}
        </Timeline>
    );
};

export default ActivityTimeline;
