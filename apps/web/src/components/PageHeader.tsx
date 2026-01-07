import { Box, Container, Typography } from '@mui/material';
import React from 'react';

interface PageHeaderProps {
  actions?: React.ReactNode;
  subtitle?: string;
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ actions, subtitle, title }) => {
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
