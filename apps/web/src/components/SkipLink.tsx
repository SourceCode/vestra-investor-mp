import { Button } from '@mui/material';
import React from 'react';

const SkipLink = () => {
  return (
    <Button
      href="#main-content"
      variant="contained"
      color="primary"
      sx={{
        '&:focus': {
          transform: 'translateY(0)',
        },
        left: 16,
        position: 'fixed',
        top: 16,
        transform: 'translateY(-200%)',
        transition: 'transform 0.2s',
        zIndex: 9999
      }}
    >
      Skip to main content
    </Button>
  );
};

export default SkipLink;