import React from 'react';
import { Button } from '@mui/material';

const SkipLink = () => {
  return (
    <Button
      href="#main-content"
      variant="contained"
      color="primary"
      sx={{
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 9999,
        transform: 'translateY(-200%)',
        transition: 'transform 0.2s',
        '&:focus': {
          transform: 'translateY(0)',
        }
      }}
    >
      Skip to main content
    </Button>
  );
};

export default SkipLink;