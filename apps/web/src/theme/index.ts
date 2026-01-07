import { alpha, createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.98)', // Less transparent for better text readability
          borderBottom: '1px solid #e2e8f0',
          boxShadow: 'none',
          color: '#0f172a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&:hover': {
            background: '#1e293b',
          },
          background: '#0f172a',
        },
        root: {
          '&:focus-visible': {
            outline: '3px solid #0f172a',
            outlineOffset: '2px',
          },
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
          borderRadius: 9999, // Pill shape
          boxShadow: 'none',
          minHeight: '44px', // WCAG Target Size
          padding: '10px 24px', // Larger target size
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        filled: {
          backgroundColor: '#f1f5f9',
          color: '#334155', // AAA compliant text on slate 100
        },
        root: {
          '&:focus-visible': {
            outline: '2px solid #0f172a',
            outlineOffset: '2px',
          },
          fontWeight: 500,
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
            borderRadius: '4px',
            outline: '2px solid #0f172a',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#475569', // Slate 600
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: '#0f172a',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: '#64748b',
            },
            '& fieldset': {
              borderColor: '#cbd5e1', // Slate 300 for better boundary visibility
            },
            borderRadius: 12,
          },
        },
      },
    },
  },
  palette: {
    background: {
      default: '#f8fafc', // Slate 50
      paper: '#ffffff',
    },
    divider: alpha('#0f172a', 0.12),
    error: {
      main: '#b91c1c', // Red 700 for better contrast
    },
    info: {
      main: '#1d4ed8', // Blue 700
    },
    primary: {
      contrastText: '#ffffff',
      light: '#334155', // Slate 700
      main: '#0f172a', // Slate 900 - High contrast
    },
    secondary: {
      contrastText: '#ffffff',
      light: '#115e59',
      main: '#0f766e', // Teal 700 - Darkened from Teal 500 (#14b8a6) for AAA contrast on white
    },
    success: {
      main: '#15803d', // Green 700
    },
    text: {
      primary: '#0f172a', // Slate 900 (~19:1 contrast on white)
      secondary: '#334155', // Slate 700 (~9:1 contrast on white - AAA)
    },
    warning: {
      main: '#b45309', // Amber 700
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    body1: { fontSize: '1rem', lineHeight: 1.7 }, // Comfortable reading
    body2: { lineHeight: 1.6 },
    button: { fontWeight: 600, letterSpacing: '0.01em', textTransform: 'none' },
    fontFamily: '"Inter", "Plus Jakarta Sans", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    subtitle1: { letterSpacing: '0.01em', lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, lineHeight: 1.5 },
  },
});

export default theme;