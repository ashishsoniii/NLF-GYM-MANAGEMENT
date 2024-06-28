import axios from 'axios';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

export default function AuthView() {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/auth/adminLogin', {
        email,
        password,
      });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('name', response.data.name);
        localStorage.setItem('phone', response.data.phone);
        router.push('../');
      } else {
        console.error('Login failed:', response.data.error);
      }
    } catch (errorz) {
      console.error('Error:', errorz);
      setError(errorz.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/auth/adminRegistration', {
        name,
        email,
        password,
        specialization: 'Admin Specialization',
        commissionRate: 100,
        phone,
      });
      if (response.status === 201) {
        setError('You are Registered Successfully, Please Login!');
        router.push('/login');
      } else {
        console.error('Registration failed:', response.data.error);
      }
    } catch (errorz) {
      console.error('Error:', errorz);
      setError(errorz.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = (
    <>
      <Stack spacing={3}>
        <TextField
          name="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      {error && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          sx={{ my: 0, color: 'red' }}
        >
          <p>{error}</p>
        </Stack>
      )}
      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}>
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={handleLogin}
        loading={loading}
      >
        Login
      </LoadingButton>
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Dont have an account?
          <Link
            variant="subtitle2"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            sx={{ cursor: 'pointer' }}
          >
            Register
          </Link>
        </Typography>
      </Stack>
    </>
  );

  const renderRegisterForm = (
    <>
      <Stack spacing={3} py={3}>
        <TextField
          name="name"
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          name="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          name="phone"
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Stack>
      {error && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          sx={{ my: 0, color: 'red' }}
        >
          <p>{error}</p>
        </Stack>
      )}
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={handleRegister}
        loading={loading}
      >
        Register
      </LoadingButton>
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link
            variant="subtitle2"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            sx={{ cursor: 'pointer' }}
          >
            Login
          </Link>
        </Typography>
      </Stack>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />
      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Welcome to GYM</Typography>
          <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
            {isLogin ? 'Admin Login' : 'Register for an account'}
          </Typography>
          {isLogin ? renderLoginForm : renderRegisterForm}
        </Card>
      </Stack>
    </Box>
  );
}
