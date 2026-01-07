import React, { useState, useEffect } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Link, Alert, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerRequest, RootState } from '../../store';
import AuthLayout from '../../components/AuthLayout';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
      firstName: '', lastName: '', email: '', password: '', confirmPassword: ''
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/onboarding'); // Redirect to onboarding on first signup
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match");
        return;
    }
    dispatch(registerRequest(formData));
  };

  return (
    <AuthLayout title="Create an account" subtitle="Start finding deals today.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert severity="error">{error}</Alert>}
        
        <Grid container spacing={2}>
            <Grid item xs={6}>
                 <TextField
                    label="First Name"
                    fullWidth
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                />
            </Grid>
            <Grid item xs={6}>
                 <TextField
                    label="Last Name"
                    fullWidth
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                />
            </Grid>
        </Grid>

        <TextField
          label="Email"
          fullWidth
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <TextField
          label="Password"
          fullWidth
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        <TextField
          label="Confirm Password"
          fullWidth
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
        />
        
        <FormControlLabel 
            control={<Checkbox required />} 
            label={<span className="text-sm text-slate-500">I agree to the <Link href="#">Terms</Link> and <Link href="#">Privacy Policy</Link></span>} 
        />

        <Button 
            fullWidth 
            size="large" 
            variant="contained" 
            type="submit" 
            disabled={loading}
            className="h-12 text-lg"
        >
            {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="text-center mt-4">
            <span className="text-slate-500">Already have an account? </span>
            <Link 
                component="button" 
                variant="body2" 
                onClick={() => navigate('/signin')} 
                type="button"
                className="font-bold text-slate-900 no-underline hover:text-teal-600"
            >
                Sign in
            </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUpPage;
