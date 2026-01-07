import React, { useState } from 'react';
import { TextField, Button, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive reset instructions.">
      {submitted ? (
         <div className="text-center">
             <Alert severity="success" className="mb-6">
                 If an account exists for <b>{email}</b>, we have sent instructions to reset your password.
             </Alert>
             <Button variant="outlined" onClick={() => navigate('/signin')}>Back to Sign In</Button>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
            label="Email"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <Button fullWidth size="large" variant="contained" type="submit" className="h-12">
                Send Instructions
            </Button>
            <div className="text-center">
                <Link component="button" type="button" onClick={() => navigate('/signin')} className="text-slate-500 hover:text-slate-900 no-underline">
                    Back to Sign In
                </Link>
            </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
