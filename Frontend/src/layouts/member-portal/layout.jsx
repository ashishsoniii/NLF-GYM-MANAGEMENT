import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import Logo from 'src/components/logo';
import { RouterLink } from 'src/routes/components';

export default function MemberPortalLayout() {
  const handleLogout = () => {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberName');
    localStorage.removeItem('memberEmail');
    window.location.href = '/';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f0f4ff 0%, #fafbff 50%, #fff 100%)',
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1877F2 0%, #0C44AE 100%)',
          color: '#fff',
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <Link
            component={RouterLink}
            href="/member"
            sx={{ display: 'inline-flex', mr: 2, color: 'inherit' }}
          >
            <Logo disabledLink />
          </Link>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: '-0.02em' }}>
            Member Portal
          </Typography>
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.5)',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#fff',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Stack
        component="main"
        sx={{
          p: { xs: 2, sm: 3 },
          maxWidth: 900,
          mx: 'auto',
          width: '100%',
        }}
      >
        <Suspense
          fallback={
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '3px solid',
                  borderColor: 'primary.light',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                  '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                  mx: 'auto',
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading...
              </Typography>
            </Box>
          }
        >
          <Outlet />
        </Suspense>
      </Stack>
    </Box>
  );
}
