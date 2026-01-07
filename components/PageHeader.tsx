import React from 'react';
import { Typography, Container, Box } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="bg-white border-b border-slate-200 py-8 mb-8">
      <Container maxWidth="lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Typography variant="h4" className="font-bold text-slate-900 mb-1">{title}</Typography>
            {subtitle && <Typography variant="body1" className="text-slate-500">{subtitle}</Typography>}
          </div>
          {actions && <Box>{actions}</Box>}
        </div>
      </Container>
    </div>
  );
};

export default PageHeader;
