import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import memberApi from 'src/api/memberAxios';

export default function MemberLoginView() {
  const theme = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async () => {
    setError(null);
    setSuccessMsg('');
    if (!email || !email.trim()) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await memberApi.post('/member-auth/send-otp', { email: email.trim() });
      setSuccessMsg('OTP sent to your email. Check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await memberApi.post('/member-auth/verify-otp', {
        email: email.trim(),
        otp: otp.trim(),
      });
      localStorage.setItem('memberToken', res.data.token);
      localStorage.setItem('memberName', res.data.member?.name || '');
      localStorage.setItem('memberEmail', res.data.member?.email || '');
      router.push('/member');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: 420,
          borderRadius: 3,
          boxShadow: `0 24px 48px ${alpha(theme.palette.grey[900], 0.12)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: step >= 1 ? 'primary.main' : 'grey.300',
            }}
          />
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: step >= 2 ? 'primary.main' : 'grey.300',
            }}
          />
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
          Member Login
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {step === 1
            ? 'Enter your email to receive a one-time password.'
            : 'Enter the 6-digit code sent to your email.'}
        </Typography>

        {step === 1 ? (
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            {error && (
              <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                {error}
              </Typography>
            )}
            <LoadingButton
              fullWidth
              size="large"
              variant="contained"
              onClick={handleSendOtp}
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
              Send OTP
            </LoadingButton>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              disabled
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputProps={{ maxLength: 6 }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, letterSpacing: 8, fontSize: '1.25rem' } }}
            />
            {successMsg && (
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                {successMsg}
              </Typography>
            )}
            {error && (
              <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                {error}
              </Typography>
            )}
            <LoadingButton
              fullWidth
              size="large"
              variant="contained"
              onClick={handleVerifyOtp}
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
              Verify & Login
            </LoadingButton>
            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                color: 'primary.main',
                fontWeight: 600,
                textAlign: 'center',
              }}
              onClick={() => { setStep(1); setOtp(''); setError(null); setSuccessMsg(''); }}
            >
              ← Use a different email
            </Typography>
          </Stack>
        )}
      </Card>
    </Box>
  );
}
