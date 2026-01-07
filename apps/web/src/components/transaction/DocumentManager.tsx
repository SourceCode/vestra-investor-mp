import { CloudUpload, Create, Download, InsertDriveFile, Visibility } from '@mui/icons-material';
import { Button, Chip, Divider, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, signDocumentRequest, uploadDocumentRequest } from '../../store';
import { DealDocument, Property } from '../../types';
import ESignModal from './ESignModal';

interface DocumentManagerProps {
    property: Property;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ property }) => {
    const dispatch = useDispatch();
    const { list: documents, uploading } = useSelector((state: RootState) => state.documents);
    const { user } = useSelector((state: RootState) => state.auth);
    const isAgent = user?.role === 'ADMIN';

    const [signingDoc, setSigningDoc] = useState<DealDocument | null>(null);

    const handleUpload = () => {
        // Mock file selection
        dispatch(uploadDocumentRequest({ file: {}, propertyId: property.id }));
    };

    const handleSign = (docId: string) => {
        dispatch(signDocumentRequest(docId));
        setTimeout(() => setSigningDoc(null), 2000); // Close modal after mock delay
    };

    const getStatusChip = (status: DealDocument['status']) => {
        switch(status) {
            case 'SIGNED': return <Chip label="Signed" size="small" color="success" variant="outlined" />;
            case 'PENDING': return <Chip label="Pending Signature" size="small" color="warning" />;
            case 'UPLOADED': return <Chip label="Uploaded" size="small" variant="outlined" />;
            default: return null;
        }
    };

    return (
        <Paper className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <Typography variant="subtitle1" className="font-bold text-slate-800">Documents</Typography>
                {isAgent && (
                    <Button 
                        startIcon={<CloudUpload />} 
                        size="small" 
                        onClick={handleUpload} 
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                )}
            </div>

            <List disablePadding>
                {documents.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No documents yet.</div>
                ) : (
                    documents.map((doc, index) => (
                        <React.Fragment key={doc.id}>
                            {index > 0 && <Divider />}
                            <ListItem className="hover:bg-slate-50 transition-colors">
                                <ListItemIcon className="min-w-[40px]">
                                    <InsertDriveFile className={doc.type === 'CONTRACT' ? 'text-blue-500' : 'text-slate-400'} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-slate-900">{doc.name}</span>
                                            {getStatusChip(doc.status)}
                                        </div>
                                    }
                                    secondary={
                                        <span className="text-xs text-slate-500">
                                            {doc.category} • {new Date(doc.updatedAt).toLocaleDateString()} • By {doc.uploadedBy}
                                        </span>
                                    }
                                />
                                <ListItemSecondaryAction className="flex gap-1">
                                    {doc.status === 'PENDING' && doc.requiresSignature && (
                                        <Button 
                                            size="small" 
                                            variant="contained" 
                                            color="secondary" 
                                            startIcon={<Create />} 
                                            onClick={() => setSigningDoc(doc)}
                                            className="mr-2"
                                        >
                                            Sign
                                        </Button>
                                    )}
                                    <IconButton size="small"><Visibility fontSize="small" /></IconButton>
                                    <IconButton size="small"><Download fontSize="small" /></IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        </React.Fragment>
                    ))
                )}
            </List>

            <ESignModal 
                open={!!signingDoc} 
                document={signingDoc} 
                onClose={() => setSigningDoc(null)} 
                onSign={handleSign}
                isSigning={uploading} // Reusing uploading state for generic async loading
            />
        </Paper>
    );
};

export default DocumentManager;
