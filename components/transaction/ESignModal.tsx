import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, Typography, IconButton, CircularProgress } from '@mui/material';
import { Close, Draw } from '@mui/icons-material';
import { DealDocument } from '../../types';

interface ESignModalProps {
    open: boolean;
    document: DealDocument | null;
    onClose: () => void;
    onSign: (docId: string) => void;
    isSigning: boolean;
}

const ESignModal: React.FC<ESignModalProps> = ({ open, document, onClose, onSign, isSigning }) => {
    if (!document) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle className="flex justify-between items-center border-b border-slate-100">
                <span>Sign Document</span>
                <IconButton onClick={onClose} disabled={isSigning}><Close /></IconButton>
            </DialogTitle>
            <DialogContent className="bg-slate-50 p-0 h-[60vh] flex flex-col">
                <div className="flex-grow flex items-center justify-center bg-slate-200 border-8 border-slate-50 overflow-hidden relative">
                    {/* Mock PDF Viewer */}
                    <div className="w-[80%] h-[90%] bg-white shadow-lg p-12 text-xs text-slate-300 select-none overflow-hidden relative">
                        <div className="w-full h-4 bg-slate-100 mb-6" />
                        <div className="w-2/3 h-4 bg-slate-100 mb-12" />
                        
                        {[...Array(15)].map((_, i) => (
                            <div key={i} className="w-full h-2 bg-slate-50 mb-3" />
                        ))}
                        
                        <div className="absolute bottom-20 left-12 right-12 border-t border-slate-200 pt-8 flex justify-between">
                            <div className="w-1/3">
                                <div className="h-10 border-b border-slate-300 mb-2" />
                                <div className="text-slate-400">Buyer Signature</div>
                            </div>
                            <div className="w-1/3">
                                <div className="h-10 border-b border-slate-300 mb-2" />
                                <div className="text-slate-400">Date</div>
                            </div>
                        </div>
                    </div>

                    {/* Signature Overlay Button */}
                    <div className="absolute bottom-[20%] left-[20%] animate-bounce">
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            startIcon={isSigning ? <CircularProgress size={20} color="inherit" /> : <Draw />}
                            onClick={() => onSign(document.id)}
                            disabled={isSigning}
                            className="shadow-xl"
                        >
                            {isSigning ? 'Signing...' : 'Click to Sign'}
                        </Button>
                    </div>
                </div>
                <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
                    <Typography variant="body2" className="text-slate-500">
                        By clicking sign, you agree to the electronic terms.
                    </Typography>
                    <Typography variant="caption" className="font-mono text-slate-400">
                        DOC ID: {document.id.toUpperCase()}
                    </Typography>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ESignModal;
