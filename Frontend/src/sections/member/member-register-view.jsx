import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import memberApi from 'src/api/memberAxios';
import { RouterLink } from 'src/routes/components';
import Link from '@mui/material/Link';

const GENDERS = ['Male', 'Female', 'Other'];
const WORKOUT_TYPES = ['Fitness', 'Weight Lifting', 'Cardio', 'Yoga', 'General'];

export default function MemberRegisterView() {
  const theme = useTheme();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    workoutType: 'Fitness',
    emergencyContact: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.name?.trim() || !form.email?.trim() || !form.phone?.trim()) {
      setError('Name, email and phone are required');
      return;
    }
    setLoading(true);
    try {
      await memberApi.post('/member/self-register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address?.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        workoutType: form.workoutType || 'Fitness',
        emergencyContact: form.emergencyContact?.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          ...bgGradient({
            color: alpha(theme.palette.background.default, 0.92),
            imgUrl: '/assets/background/overlay_4.jpg',
          }),
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3,
          px: 2,
        }}
      >
        <Card
          sx={{
            p: 4,
            width: 1,
            maxWidth: 420,
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: `0 24px 48px ${alpha(theme.palette.grey[900], 0.12)}`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              color: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 700,
              mx: 'auto',
              mb: 2,
            }}
          >
            ✓
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.dark', mb: 1 }}>
            You’re in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Login with your email using the OTP we’ll send you.
          </Typography>
          <LoadingButton
            component={RouterLink}
            to="/member/login"
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00A76F 0%, #007867 100%)',
              boxShadow: '0 4px 14px rgba(0, 167, 111, 0.4)',
            }}
          >
            Go to Login
          </LoadingButton>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />
      <Card
        sx={{
          p: 4,
          width: 1,
          maxWidth: 480,
          borderRadius: 3,
          boxShadow: `0 24px 48px ${alpha(theme.palette.grey[900], 0.12)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
          Join the gym
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create your member account and login with OTP.
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            required
            name="name"
            label="Full Name"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            required
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            required
            name="phone"
            label="Phone"
            value={form.phone}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            name="address"
            label="Address"
            value={form.address}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            select
            name="gender"
            label="Gender"
            value={form.gender}
            onChange={handleChange}
          >
            <MenuItem value="">—</MenuItem>
            {GENDERS.map((g) => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            name="workoutType"
            label="Workout Type"
            value={form.workoutType}
            onChange={handleChange}
          >
            {WORKOUT_TYPES.map((w) => (
              <MenuItem key={w} value={w}>{w}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            name="emergencyContact"
            label="Emergency Contact"
            value={form.emergencyContact}
            onChange={handleChange}
          />
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            onClick={handleSubmit}
            loading={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1877F2 0%, #0C44AE 100%)',
              boxShadow: '0 4px 14px rgba(24, 119, 242, 0.4)',
            }}
          >
            Register
          </LoadingButton>
          <Typography variant="body2" sx={{ textAlign: 'center', pt: 1 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/member/login" sx={{ fontWeight: 600 }}>
              Login
            </Link>
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
}
