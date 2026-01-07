import { AccountBalance, CheckCircle, Description, Security } from '@mui/icons-material';
import { Avatar, Button, Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { requestServiceRequest, RootState } from '../../store';
import { Property, ServiceIntegration } from '../../types';

interface ServicePanelProps {
    property: Property;
}

const ServicePanel: React.FC<ServicePanelProps> = ({ property }) => {
    const dispatch = useDispatch();
    const { list: services } = useSelector((state: RootState) => state.services);

    const handleRequest = (type: string) => {
        dispatch(requestServiceRequest({ propertyId: property.id, type }));
    };

    const getIcon = (type: ServiceIntegration['type']) => {
        switch (type) {
            case 'TITLE': return <Description />;
            case 'LENDER': return <AccountBalance />;
            case 'INSURANCE': return <Security />;
            default: return <Description />;
        }
    };

    return (
        <div className="mt-8">
            <Typography variant="h6" className="font-bold mb-4 text-slate-900">Integrated Services</Typography>
            <Grid container spacing={3}>
                {services.map(service => (
                    <Grid size={{ xs: 12, md: 4 }} key={service.id}>
                        <Paper className="p-5 rounded-xl border border-slate-200 h-full flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                                        {getIcon(service.type)}
                                    </div>
                                    {service.status === 'COMPLETE' || service.status === 'IN_PROGRESS' ? (
                                        <CheckCircle className="text-emerald-500" />
                                    ) : null}
                                </div>
                                <Typography variant="subtitle1" className="font-bold text-slate-900 mb-1">{service.name}</Typography>
                                <Typography variant="body2" className="text-slate-500 text-sm mb-4">
                                    {service.type === 'TITLE' ? 'Title & Escrow' : service.type === 'LENDER' ? 'Financing' : 'Property Insurance'}
                                </Typography>

                                {service.contactName && (
                                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded mb-4">
                                        <b>Contact:</b> {service.contactName}
                                        <br />
                                        {service.contactEmail}
                                    </div>
                                )}
                            </div>

                            <Button
                                variant={service.status === 'NOT_STARTED' ? 'outlined' : 'contained'}
                                color={service.status === 'NOT_STARTED' ? 'inherit' : service.status === 'IN_PROGRESS' ? 'primary' : 'success'}
                                fullWidth
                                onClick={() => handleRequest(service.type)}
                                disabled={service.status !== 'NOT_STARTED'}
                                className="mt-auto"
                            >
                                {service.status === 'NOT_STARTED' ? 'Start Order' : service.status === 'REQUESTED' ? 'Requested' : service.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default ServicePanel;
