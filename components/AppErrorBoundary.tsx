import React, { ErrorInfo, ReactNode } from 'react';
import { Button, Typography, Container, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: any): ErrorBoundaryState {
    // Safely extract error message without risking circular dependency serialization
    let msg = 'Unknown error';
    try {
        if (error instanceof Error) {
            msg = error.message;
        } else if (typeof error === 'string') {
            msg = error;
        } else if (error && typeof error === 'object') {
             // Handle objects like DOM nodes or Events that might be thrown
             if (error.constructor && error.constructor.name) {
                 msg = `Error object: ${error.constructor.name}`;
             } else {
                 msg = 'An unexpected object was thrown as an error.';
             }
        }
    } catch (e) {
        msg = 'Error could not be processed.';
    }
    
    return { hasError: true, errorMessage: msg };
  }

  public componentDidCatch(error: any, errorInfo: ErrorInfo) {
    // Avoid passing potentially circular objects (like DOM nodes) directly to console 
    // if the environment tries to serialize them.
    console.error('AppErrorBoundary caught an error.');
    console.error('Component Stack:', errorInfo.componentStack);
    
    try {
        if (error instanceof Error) {
            console.error(error);
        } else {
            // Log a string representation to be safe
            console.error('Non-Error object caught:', String(error));
        }
    } catch (e) {
        console.error('Failed to log error details.');
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <Container maxWidth="sm">
            <Paper className="p-8 rounded-xl border border-slate-200 text-center shadow-sm">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ErrorOutline className="text-red-500 text-3xl" />
                </div>
                <Typography variant="h5" className="font-bold text-slate-900 mb-2">
                    Something went wrong
                </Typography>
                <Typography variant="body1" className="text-slate-500 mb-8">
                    We encountered an unexpected error. Please try reloading the page.
                </Typography>
                <div className="flex gap-4 justify-center">
                    <Button 
                        variant="outlined" 
                        onClick={() => window.location.href = '/'}
                    >
                        Go Home
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<Refresh />}
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </Button>
                </div>
                <Typography variant="caption" className="text-slate-400 mt-8 block font-mono break-all px-4">
                    {this.state.errorMessage}
                </Typography>
            </Paper>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;