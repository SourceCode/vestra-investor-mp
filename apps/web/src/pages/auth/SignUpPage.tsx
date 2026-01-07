import { Alert, Button, Checkbox, FormControlLabel, Grid, Link, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import AuthLayout from '../../components/AuthLayout';
import { registerRequest, RootState } from '../../store';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    isInvestor: false
  });

  useEffect(() => {
    if (isAuthenticated) {
      if (formData.isInvestor) {
        navigate('/onboarding/investor');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate, formData.isInvestor]);

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (formData.isInvestor) {
        navigate('/onboarding/investor');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate, formData.isInvestor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords don't match");
      return;
    }
    dispatch(registerRequest({
      ...formData,
      organizationName: `${formData.firstName}'s Org`,
      organizationType: formData.isInvestor ? 'INVESTOR' : 'WHOLESALER'
    }));
  };

  return (
    <AuthLayout title="Create an account" subtitle="Start finding deals today.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || validationError) && <Alert severity="error">{validationError || error}</Alert>}

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="First Name"
              fullWidth
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Last Name"
              fullWidth
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </Grid>
        </Grid>

        <TextField
          label="Email"
          fullWidth
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <TextField
          label="Password"
          fullWidth
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <TextField
          label="Confirm Password"
          fullWidth
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isInvestor}
              onChange={(e) => setFormData({ ...formData, isInvestor: e.target.checked })}
            />
          }
          label="I am an Investor"
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
