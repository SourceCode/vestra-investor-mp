import { Box, Container, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useTenant } from '../contexts/TenantConfigContext';

interface AuthLayoutProps {
    children: React.ReactNode;
    subtitle?: string;
    title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, subtitle, title }) => {
    const tenant = useTenant();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="relative z-10 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl mb-4">V</div>
                    <Typography variant="h6" className="font-bold tracking-tight">{tenant.name}</Typography>
                </div>

                <div className="relative z-10 max-w-lg">
                    <Typography variant="h3" className="font-bold mb-6">Unlock exclusive off-market value-add deals.</Typography>
                    <Typography variant="h6" className="font-normal text-slate-400">Join thousands of investors using {tenant.name} to find, underwrite, and close deals faster.</Typography>
                </div>

                <div className="relative z-10 text-sm text-slate-500">
                    © 2024 {tenant.name} Inc.
                </div>

                {/* Decor */}
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-bl from-slate-800 to-transparent opacity-50 pointer-events-none" />
                <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-teal-900/40 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <Box className="w-full max-w-md">
                    <div className="mb-8 text-center lg:text-left">
                        <Typography variant="h4" component="h1" className="font-bold text-slate-900 mb-2">{title}</Typography>
                        {subtitle && <Typography variant="body1" className="text-slate-500">{subtitle}</Typography>}
                    </div>
                    {children}
                </Box>
            </div>
        </div>
    );
};

export default AuthLayout;
