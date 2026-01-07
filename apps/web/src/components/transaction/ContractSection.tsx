import { Create, Description, Download, Visibility } from '@mui/icons-material';
import { Button, Chip, CircularProgress, Divider, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { DealDocument, Property } from '../../types';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../contexts/ToastContext';
import { Contract, ContractStatus, ContractType } from '../../types';
import ESignModal from './ESignModal';

interface ContractSectionProps {
    property: Property;
}

const ContractSection: React.FC<ContractSectionProps> = ({ property }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isAgent = user?.role === 'ADMIN';
    const { showToast } = useToast();
    const utils = trpc.useContext();

    const [signingContract, setSigningContract] = useState<Contract | null>(null);

    const { data: contracts = [], isLoading } = trpc.contract.byDeal.useQuery({ dealId: property.id });

    const generateContract = trpc.contract.generate.useMutation({
        onSuccess: () => {
            utils.contract.byDeal.invalidate({ dealId: property.id });
            showToast('Contract generated successfully', 'success');
        },
        onError: (err) => {
            showToast(`Failed to generate contract: ${err.message}`, 'error');
        }
    });

    const signContract = trpc.contract.updateStatus.useMutation({
        onSuccess: () => {
            utils.contract.byDeal.invalidate({ dealId: property.id });
            showToast('Contract signed successfully', 'success');
            setSigningContract(null);
        },
        onError: (err) => {
            showToast(`Failed to sign contract: ${err.message}`, 'error');
        }
    });

    const handleGenerate = () => {
        generateContract.mutate({ dealId: property.id, type: ContractType.PURCHASE_AGREEMENT });
    };

    const handleSignClick = (contract: Contract) => {
        setSigningContract(contract);
    };

    const handleSignConfirm = (id: string) => {
        signContract.mutate({ id, status: ContractStatus.SIGNED });
    };

    const getStatusChip = (status: ContractStatus) => {
        switch (status) {
            case ContractStatus.SIGNED: return <Chip label="Signed" size="small" color="success" />;
            case ContractStatus.GENERATED: return <Chip label="Action Required" size="small" color="warning" />;
            case ContractStatus.DRAFT: return <Chip label="Draft" size="small" variant="outlined" />;
            case ContractStatus.VOIDED: return <Chip label="Voided" size="small" color="error" />;
            default: return null;
        }
    };

    if (isLoading) return <CircularProgress size={20} />;

    return (
        <Paper className="rounded-xl border border-slate-200 overflow-hidden mb-8">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <Typography variant="subtitle1" className="font-bold text-slate-800">Contracts</Typography>
                {isAgent && (
                    <Button
                        startIcon={<Description />}
                        size="small"
                        variant="contained"
                        onClick={handleGenerate}
                        disabled={generateContract.isPending}
                    >
                        {generateContract.isPending ? 'Generating...' : 'Generate Agreement'}
                    </Button>
                )}
            </div>

            <List disablePadding>
                {contracts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No contracts generated yet.</div>
                ) : (
                    contracts.map((doc, index) => (
                        <React.Fragment key={doc.id}>
                            {index > 0 && <Divider />}
                            <ListItem className="hover:bg-slate-50 transition-colors">
                                <ListItemIcon className="min-w-[40px]">
                                    <Description className="text-purple-600" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-slate-900">
                                                {doc.type.replace('_', ' ')}
                                            </span>
                                            {getStatusChip(doc.status as ContractStatus)}
                                        </div>
                                    }
                                    secondary={
                                        <span className="text-xs text-slate-500">
                                            Generated: {new Date(doc.generatedAt).toLocaleDateString()}
                                            {doc.signedAt && ` • Signed: ${new Date(doc.signedAt).toLocaleDateString()}`}
                                        </span>
                                    }
                                />
                                <ListItemSecondaryAction className="flex gap-1">
                                    {doc.status === ContractStatus.GENERATED && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<Create />}
                                            onClick={() => handleSignClick(doc as Contract)}
                                            className="mr-2"
                                            disabled={signContract.isPending}
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
                open={!!signingContract}
                document={signingContract as unknown as DealDocument}
                onClose={() => setSigningContract(null)}
                onSign={handleSignConfirm}
                isSigning={signContract.isPending}
            />
        </Paper>
    );
};

export default ContractSection;
