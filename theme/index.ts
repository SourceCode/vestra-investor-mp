import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2.5rem' },
    h2: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '2rem' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    subtitle1: { letterSpacing: '0.01em', lineHeight: 1.5 },
    subtitle2: { lineHeight: 1.5, fontWeight: 500 },
    body1: { lineHeight: 1.7, fontSize: '1rem' }, // Comfortable reading
    body2: { lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 12,
  },
  palette: {
    primary: {
      main: '#0f172a', // Slate 900 - High contrast
      light: '#334155', // Slate 700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e', // Teal 700 - Darkened from Teal 500 (#14b8a6) for AAA contrast on white
      light: '#115e59',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Slate 50
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate 900 (~19:1 contrast on white)
      secondary: '#334155', // Slate 700 (~9:1 contrast on white - AAA)
    },
    divider: alpha('#0f172a', 0.12),
    error: {
      main: '#b91c1c', // Red 700 for better contrast
    },
    warning: {
      main: '#b45309', // Amber 700
    },
    success: {
      main: '#15803d', // Green 700
    },
    info: {
      main: '#1d4ed8', // Blue 700
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999, // Pill shape
          padding: '10px 24px', // Larger target size
          boxShadow: 'none',
          minHeight: '44px', // WCAG Target Size
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
          '&:focus-visible': {
            outline: '3px solid #0f172a',
            outlineOffset: '2px',
          },
        },
        containedPrimary: {
          background: '#0f172a',
          '&:hover': {
            background: '#1e293b',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          '&:focus-visible': {
            outline: '2px solid #0f172a',
            outlineOffset: '2px',
          },
        },
        filled: {
          backgroundColor: '#f1f5f9',
          color: '#334155', // AAA compliant text on slate 100
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)', // Less transparent for better text readability
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: 'none',
          color: '#0f172a',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: '#cbd5e1', // Slate 300 for better boundary visibility
            },
            '&:hover fieldset': {
              borderColor: '#64748b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0f172a',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#475569', // Slate 600
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #0f172a',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #0f172a',
            outlineOffset: '2px',
            borderRadius: '4px',
          },
        },
      },
    },
  },
});

export default theme;