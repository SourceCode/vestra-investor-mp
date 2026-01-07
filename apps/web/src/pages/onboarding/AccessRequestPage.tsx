import { Button, Container, Paper, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../../components/PageHeader';
import { useToast } from '../../contexts/ToastContext';
import { requestAccess } from '../../store';

const AccessRequestPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showToast } = useToast();
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        dispatch(requestAccess({ message }));
        showToast('Access request submitted successfully');
        navigate('/browse');
    };

    return (
        <div className="min-h-screen bg-slate-50">
             <PageHeader title="Request Full Access" subtitle="Unlock property address and financials." />
             <Container maxWidth="md">
                 <Paper className="p-8 rounded-xl border border-slate-200">
                     <Typography variant="h6" className="font-bold mb-4">Message to Agent</Typography>
                     <Typography variant="body2" className="text-slate-500 mb-6">
                         Please provide a brief message about your interest or investing background. This helps expedite the approval process.
                     </Typography>
                     
                     <TextField 
                        multiline 
                        rows={4} 
                        fullWidth 
                        placeholder="Hi, I am an experienced investor interested in this property..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mb-6"
                     />
                     
                     <div className="flex justify-end gap-4">
                         <Button onClick={() => navigate(-1)}>Cancel</Button>
                         <Button variant="contained" size="large" onClick={handleSubmit}>Submit Request</Button>
                     </div>
                 </Paper>
             </Container>
        </div>
    );
};

export default AccessRequestPage;
