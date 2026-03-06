import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import api from 'src/api/axios';
import memberApi from 'src/api/memberAxios';

// ----------------------------------------------------------------------
// Unified login — one email → password (admin) or OTP (member)
// Design: bluish white, blue accent, tall inputs, matches inside UI
// ----------------------------------------------------------------------

const ACCENT = '#1877F2';
const BG_BLUE = '#eef4ff';
const BG_WHITE = '#f8fafc';
const CARD_BG = '#ffffff';
const BORDER = 'rgba(24, 119, 242, 0.15)';
const TEXT = '#1a202c';
const TEXT_MUTED = '#64748b';

export default function UnifiedLoginView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState(null);
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const handleContinue = async () => {
    setError(null);
    setSuccessMsg('');
    if (!normalizedEmail) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/auth/email-type', { params: { email: normalizedEmail } });
      setUserType(data.type);
      setStep(2);
      if (data.type !== 'admin') setOtpSent(false);
    } catch (err) {
      setError(err.response?.data?.error || 'No account found with this email.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setError(null);
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/adminLogin', { email: normalizedEmail, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('phone', res.data.phone || '');
      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    setSuccessMsg('');
    setLoading(true);
    try {
      await memberApi.post('/member-auth/send-otp', { email: normalizedEmail });
      setSuccessMsg('Check your inbox for the code.');
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp || otp.length < 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await memberApi.post('/member-auth/verify-otp', {
        email: normalizedEmail,
        otp: otp.trim(),
      });
      localStorage.setItem('memberToken', res.data.token);
      localStorage.setItem('memberName', res.data.member?.name || '');
      localStorage.setItem('memberEmail', res.data.member?.email || '');
      router.push('/member');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setUserType(null);
    setPassword('');
    setOtp('');
    setOtpSent(false);
    setError(null);
    setSuccessMsg('');
  };

  const isAdminFlow = userType === 'admin';
  const isMemberFlow = userType === 'member';

  // Label above field; tall input box, matches rest of app
  const labelSx = {
    color: TEXT_MUTED,
    fontSize: '0.875rem',
    fontWeight: 600,
    mb: 1,
    display: 'block',
  };
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: CARD_BG,
      color: TEXT,
      border: '1px solid rgba(0,0,0,0.12)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      minHeight: 56,
      '&:hover': { borderColor: 'rgba(24, 119, 242, 0.4)' },
      '&.Mui-focused': {
        borderColor: ACCENT,
        boxShadow: `0 0 0 2px ${ACCENT}30`,
        '& fieldset': { border: 'none' },
      },
      '& fieldset': { border: 'none' },
    },
    '& .MuiInputBase-input': {
      py: 2,
      px: 2,
      fontSize: '1rem',
      boxSizing: 'border-box',
    },
    '& .MuiInputBase-input::placeholder': { color: TEXT_MUTED, opacity: 1 },
  };

  const btnSx = {
    py: 2,
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '0.02em',
    bgcolor: ACCENT,
    color: '#fff',
    boxShadow: '0 4px 14px rgba(24, 119, 242, 0.35)',
    '&:hover': {
      bgcolor: '#0C44AE',
      boxShadow: '0 6px 20px rgba(24, 119, 242, 0.45)',
      transform: 'translateY(-1px)',
    },
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        background: `linear-gradient(160deg, ${BG_WHITE} 0%, ${BG_BLUE} 50%, #e0e7ff 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Subtle blue gradient overlay */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(ellipse 100% 80% at 10% 20%, rgba(24, 119, 242, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 90% 80%, rgba(24, 119, 242, 0.06) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Logo top-left */}
      <Logo
        disabledLink
        sx={{
          position: 'fixed',
          top: { xs: 20, sm: 28 },
          left: { xs: 20, sm: 28 },
          zIndex: 10,
          width: 48,
          height: 48,
          '& img': { width: '100%', height: '100%', objectFit: 'contain' },
        }}
      />

      {/* Left: branding (desktop) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          position: 'relative',
          zIndex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Syne", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(3rem, 8vw, 5.5rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              color: ACCENT,
              mb: 2,
            }}
          >
            NLF GYM
          </Typography>
          <Typography
            sx={{
              color: TEXT_MUTED,
              fontSize: '0.9rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Get in. Train. Own it.
          </Typography>
        </Box>
      </Box>

      {/* Right: form card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: { md: '0 0 50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 4 },
          minHeight: { xs: '100vh', md: 'auto' },
        }}
      >
        {/* Mobile headline — right of logo */}
        <Typography
          component="h1"
          sx={{
            display: { md: 'none' },
            position: 'absolute',
            top: 28,
            left: 80,
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: '1.75rem',
            letterSpacing: '-0.03em',
            color: ACCENT,
          }}
        >
          NLF GYM
        </Typography>

        <Box
          sx={{
            width: 1,
            maxWidth: 420,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            bgcolor: CARD_BG,
            border: `1px solid ${BORDER}`,
            boxShadow: '0 8px 40px rgba(24, 119, 242, 0.12)',
            animation: 'cardIn 0.6s ease-out',
            '@keyframes cardIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {step === 1 && (
            <>
              <Typography
                sx={{
                  color: TEXT,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  mb: 0.5,
                }}
              >
                Welcome back
              </Typography>
              <Typography sx={{ color: TEXT_MUTED, fontSize: '0.9rem', mb: 3 }}>
                Enter your email to continue
              </Typography>
              <Stack spacing={2.5}>
                <Box>
                  <Typography component="label" sx={labelSx} htmlFor="login-email">
                    Email
                  </Typography>
                  <TextField
                    id="login-email"
                    fullWidth
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                    sx={inputSx}
                  />
                </Box>
                {error && (
                  <Typography variant="body2" sx={{ color: '#ff6b6b', fontWeight: 600 }}>
                    {error}
                  </Typography>
                )}
                <LoadingButton
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={handleContinue}
                  loading={loading}
                  sx={btnSx}
                >
                  Continue
                </LoadingButton>
              </Stack>
            </>
          )}

          {step === 2 && isAdminFlow && (
            <>
              <Typography
                sx={{
                  color: TEXT,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  mb: 0.5,
                }}
              >
                Admin sign in
              </Typography>
              <Typography sx={{ color: TEXT_MUTED, fontSize: '0.9rem', mb: 3 }}>
                Enter your password for {normalizedEmail}
              </Typography>
              <Stack spacing={2.5}>
                <Box>
                  <Typography component="label" sx={labelSx}>Email</Typography>
                  <TextField
                    fullWidth
                    type="email"
                    value={email}
                    disabled
                    sx={inputSx}
                  />
                </Box>
                <Box>
                  <Typography component="label" sx={labelSx}>Password</Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                    placeholder="••••••••"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: TEXT_MUTED, '&:hover': { color: TEXT } }}
                          >
                            <Iconify icon={showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Box>
                {error && (
                  <Typography variant="body2" sx={{ color: '#ff6b6b', fontWeight: 600 }}>
                    {error}
                  </Typography>
                )}
                <LoadingButton
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={handleAdminLogin}
                  loading={loading}
                  sx={btnSx}
                >
                  Sign in
                </LoadingButton>
                <Typography
                  variant="body2"
                  component="button"
                  onClick={handleBack}
                  sx={{
                    cursor: 'pointer',
                    color: TEXT_MUTED,
                    fontWeight: 600,
                    textAlign: 'center',
                    border: 'none',
                    background: 'none',
                    '&:hover': { color: ACCENT },
                    transition: 'color 0.2s',
                  }}
                >
                  ← Use a different email
                </Typography>
              </Stack>
            </>
          )}

          {step === 2 && isMemberFlow && !otpSent && (
            <>
              <Typography
                sx={{
                  color: TEXT,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  mb: 0.5,
                }}
              >
                Member login
              </Typography>
              <Typography sx={{ color: TEXT_MUTED, fontSize: '0.9rem', mb: 3 }}>
                We’ll send a one-time code to {normalizedEmail}
              </Typography>
              <Stack spacing={2.5}>
                <Box>
                  <Typography component="label" sx={labelSx}>Email</Typography>
                  <TextField
                    fullWidth
                    type="email"
                    value={email}
                    disabled
                    sx={inputSx}
                  />
                </Box>
                {error && (
                  <Typography variant="body2" sx={{ color: '#ff6b6b', fontWeight: 600 }}>
                    {error}
                  </Typography>
                )}
                <LoadingButton
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={handleSendOtp}
                  loading={loading}
                  sx={btnSx}
                >
                  Send code
                </LoadingButton>
                <Typography
                  variant="body2"
                  component="button"
                  onClick={handleBack}
                  sx={{
                    cursor: 'pointer',
                    color: TEXT_MUTED,
                    fontWeight: 600,
                    textAlign: 'center',
                    border: 'none',
                    background: 'none',
                    '&:hover': { color: ACCENT },
                    transition: 'color 0.2s',
                  }}
                >
                  ← Use a different email
                </Typography>
              </Stack>
            </>
          )}

          {step === 2 && isMemberFlow && otpSent && (
            <>
              <Typography
                sx={{
                  color: TEXT,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  mb: 0.5,
                }}
              >
                Enter code
              </Typography>
              <Typography sx={{ color: TEXT_MUTED, fontSize: '0.9rem', mb: 3 }}>
                {successMsg || 'Enter the 6-digit code from your email'}
              </Typography>
              <Stack spacing={2.5}>
                <Box>
                  <Typography component="label" sx={labelSx}>Email</Typography>
                  <TextField
                    fullWidth
                    type="email"
                    value={email}
                    disabled
                    sx={inputSx}
                  />
                </Box>
                <Box>
                  <Typography component="label" sx={labelSx}>Code</Typography>
                  <TextField
                    fullWidth
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    inputProps={{ maxLength: 6 }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                    sx={{
                      ...inputSx,
                      '& .MuiOutlinedInput-root input': {
                        letterSpacing: 10,
                        fontSize: '1.35rem',
                        textAlign: 'center',
                      },
                    }}
                  />
                </Box>
                {error && (
                  <Typography variant="body2" sx={{ color: '#ff6b6b', fontWeight: 600 }}>
                    {error}
                  </Typography>
                )}
                <LoadingButton
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={handleVerifyOtp}
                  loading={loading}
                  sx={btnSx}
                >
                  Verify & sign in
                </LoadingButton>
                <Typography
                  variant="body2"
                  component="button"
                  onClick={handleBack}
                  sx={{
                    cursor: 'pointer',
                    color: TEXT_MUTED,
                    fontWeight: 600,
                    textAlign: 'center',
                    border: 'none',
                    background: 'none',
                    '&:hover': { color: ACCENT },
                    transition: 'color 0.2s',
                  }}
                >
                  ← Use a different email
                </Typography>
              </Stack>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
