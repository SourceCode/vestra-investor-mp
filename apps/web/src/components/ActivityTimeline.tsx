import { Description, Gavel, MonetizationOn, Update } from '@mui/icons-material';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { Paper, Typography } from '@mui/material';
import React from 'react';
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
        <Timeline position="right" sx={{ margin: 0, padding: 0 }}>
            {list.map((item) => (
                <TimelineItem key={item.id} sx={{ '&:before': { display: 'none' } }}>
                    <TimelineSeparator>
                        <TimelineDot color={getColor(item.type)} variant="outlined">
                            {getIcon(item.type)}
                        </TimelineDot>
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ px: 2, py: '12px' }}>
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
