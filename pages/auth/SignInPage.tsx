import React, { useState, useEffect } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, RootState } from '../../store';
import AuthLayout from '../../components/AuthLayout';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/browse');
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginRequest({ email, password }));
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Please enter your details to sign in.">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert severity="error">{error}</Alert>}
        
        <TextField
          label="Email"
          fullWidth
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="flex justify-between items-center">
            <FormControlLabel control={<Checkbox defaultChecked />} label="Remember me" />
            <Link 
                component="button" 
                variant="body2" 
                onClick={() => navigate('/forgot-password')} 
                type="button"
                className="font-semibold text-slate-900 no-underline hover:text-teal-600"
            >
                Forgot password?
            </Link>
        </div>

        <Button 
            fullWidth 
            size="large" 
            variant="contained" 
            type="submit" 
            disabled={loading}
            className="h-12 text-lg"
        >
            {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="text-center mt-6">
            <span className="text-slate-500">Don't have an account? </span>
            <Link 
                component="button" 
                variant="body2" 
                onClick={() => navigate('/signup')} 
                type="button"
                className="font-bold text-slate-900 no-underline hover:text-teal-600"
            >
                Sign up for free
            </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignInPage;
