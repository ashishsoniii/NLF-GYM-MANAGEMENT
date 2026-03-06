import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TableContainer from '@mui/material/TableContainer';

import Iconify from 'src/components/iconify';
import memberApi from 'src/api/memberAxios';
import { fDateLong } from 'src/utils/format-time';

const GENDERS = ['Male', 'Female', 'Other'];
const WORKOUT_TYPES = ['Fitness', 'Weight Lifting', 'Cardio', 'Yoga', 'General'];
const EDITABLE_FIELDS = ['address', 'dateOfBirth', 'gender', 'workoutType', 'emergencyContact', 'notes'];

export default function MemberDashboardView() {
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMember = async () => {
    try {
      const res = await memberApi.get('/member/me');
      setMember(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await memberApi.get('/member/me/payments');
      setPayments(res.data.payments || []);
    } catch {
      setPayments([]);
    }
  };

  useEffect(() => {
    fetchMember();
  }, []);

  useEffect(() => {
    if (member) fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?._id]);

  const handleOpenEdit = () => {
    setEditForm({
      address: member?.address || '',
      dateOfBirth: member?.dateOfBirth ? new Date(member.dateOfBirth).toISOString().slice(0, 10) : '',
      gender: member?.gender || '',
      workoutType: member?.workoutType || 'Fitness',
      emergencyContact: member?.emergencyContact || '',
      notes: member?.notes || '',
    });
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {};
      EDITABLE_FIELDS.forEach((key) => {
        if (editForm[key] !== undefined) {
          payload[key] = editForm[key] || null;
        }
      });
      const res = await memberApi.patch('/member/me', payload);
      setMember(res.data);
      setEditOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const openRazorpay = async () => {
    if (!member?.membershipPlan) return;
    setPayLoading(true);
    setError(null);
    try {
      const { data } = await memberApi.post('/member/payment/create-order', {
        planId: member.membershipPlan,
      });
      const { razorpayKey: key, orderId, amount, currency: currencyVal } = data;
      const currency = currencyVal || 'INR';

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const { Razorpay } = window;
        if (!Razorpay) {
          setError('Payment gateway could not be loaded');
          setPayLoading(false);
          return;
        }
        const options = {
          key,
          amount,
          currency,
          order_id: orderId,
          name: 'NLF Gym',
          description: `Plan: ${member?.latestPlanName || 'Renewal'}`,
          handler(response) {
            memberApi
              .post('/member/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: member?.membershipPlan,
              })
              .then((res) => {
                setMember(res.data.member);
                fetchPayments();
                setError(null);
              })
              .catch((err) => {
                setError(err.response?.data?.error || 'Payment verification failed');
              })
              .finally(() => setPayLoading(false));
          },
          prefill: {
            name: member?.name,
            email: member?.email,
            contact: member?.phone,
          },
        };
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', () => {
          setError('Payment failed or was cancelled');
          setPayLoading(false);
        });
        rzp.open();
        setPayLoading(false);
      };
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start payment');
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
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
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  if (error && !member) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const isExpired = member?.expiryDate && new Date(member.expiryDate) < new Date();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
          Hey, {member?.name?.split(' ')[0] || 'there'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here’s your membership at a glance.
        </Typography>
      </Box>
      {error && (
        <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
          {error}
        </Typography>
      )}

      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Profile
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpenEdit}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Edit profile
          </Button>
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell>{member?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell>{member?.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell>{member?.phone}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                <TableCell>{member?.address || '—'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date of Birth</TableCell>
                <TableCell>
                  {member?.dateOfBirth
                    ? new Date(member.dateOfBirth).toISOString().slice(0, 10)
                    : '—'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
                <TableCell>{member?.gender || '—'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Workout type</TableCell>
                <TableCell>{member?.workoutType || '—'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Emergency contact</TableCell>
                <TableCell>{member?.emergencyContact || '—'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid',
          borderColor: isExpired ? 'error.light' : 'success.light',
          borderLeftWidth: 4,
          borderLeftColor: isExpired ? 'error.main' : 'success.main',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {member?.latestPlanName || 'No plan assigned'}
              </Typography>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 2,
                  typography: 'caption',
                  fontWeight: 700,
                  bgcolor: isExpired ? 'error.lighter' : 'success.lighter',
                  color: isExpired ? 'error.dark' : 'success.dark',
                }}
              >
                {isExpired ? 'Expired' : 'Active'}
              </Box>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Expires{' '}
              <span title={fDateLong(member?.expiryDate)}>
                {member?.expiryDate
                  ? new Date(member.expiryDate).toISOString().slice(0, 10)
                  : '—'}
              </span>
            </Typography>
          </Box>
          {member?.membershipPlan ? (
            <LoadingButton
              variant="contained"
              size="medium"
              loading={payLoading}
              onClick={openRazorpay}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                background: 'linear-gradient(135deg, #1877F2 0%, #0C44AE 100%)',
                boxShadow: '0 4px 14px rgba(24, 119, 242, 0.35)',
              }}
            >
              Pay / Renew
            </LoadingButton>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Your plan is assigned by the gym. Contact admin for renewal or payment.
            </Typography>
          )}
        </Stack>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #1877F2 0%, #00A76F 50%, #1877F2 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 8s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%, 100%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
            },
          }}
        />
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2.5, pb: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="solar:card-recive-bold-duotone" width={24} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Payment history
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {payments.length === 0
                ? 'Your transactions will appear here'
                : `${payments.length} transaction${payments.length === 1 ? '' : 's'}`}
            </Typography>
          </Box>
          {payments.length > 0 && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                typography: 'caption',
                fontWeight: 700,
              }}
            >
              {payments.length}
            </Box>
          )}
        </Stack>
        {payments.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              py: 6,
              px: 3,
              bgcolor: 'grey.50',
              borderRadius: 2,
              mx: 2.5,
              mb: 2.5,
              border: '1px dashed',
              borderColor: 'grey.300',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'grey.200',
                color: 'grey.500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <Iconify icon="solar:wallet-money-bold-duotone" width={32} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'grey.600' }}>
              No payments yet
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              When you renew or pay, it’ll show up here
            </Typography>
          </Stack>
        ) : (
          <TableContainer sx={{ px: 2.5, pb: 2.5, pt: 1 }}>
            <Table size="small" sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: 'grey.50',
                    '& .MuiTableCell-head': {
                      color: 'grey.700',
                      fontWeight: 700,
                      py: 2,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      borderBottom: 'none',
                    },
                  }}
                >
                  <TableCell>Plan</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment date</TableCell>
                  <TableCell>Start date</TableCell>
                  <TableCell>Expiry date</TableCell>
                  <TableCell>Method</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p, i) => (
                  <TableRow
                    key={i}
                    sx={{
                      bgcolor: 'background.paper',
                      borderLeft: '3px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                        borderLeftColor: 'primary.main',
                      },
                      '& .MuiTableCell-root': {
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: 'grey.800' }}>
                      {p.plan?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: 'success.lighter',
                          color: 'success.dark',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}
                      >
                        ₹{p.amount}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'grey.700' }}>
                      <span title={fDateLong(p.date)}>
                        {p.date ? new Date(p.date).toISOString().slice(0, 10) : '—'}
                      </span>
                    </TableCell>
                    <TableCell sx={{ color: 'grey.700' }}>
                      <span title={fDateLong(p.joiningDate)}>
                        {p.joiningDate ? new Date(p.joiningDate).toISOString().slice(0, 10) : '—'}
                      </span>
                    </TableCell>
                    <TableCell sx={{ color: 'grey.700' }}>
                      <span title={fDateLong(p.expiryDate)}>
                        {p.expiryDate ? new Date(p.expiryDate).toISOString().slice(0, 10) : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.25,
                          py: 0.25,
                          borderRadius: 1.5,
                          typography: 'caption',
                          fontWeight: 600,
                          bgcolor: 'grey.200',
                          color: 'grey.700',
                        }}
                      >
                        {p.paymentMethod || '—'}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 24px 48px rgba(0,0,0,0.12)' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>Edit profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              name="address"
              label="Address"
              value={editForm.address}
              onChange={handleEditChange}
            />
            <TextField
              fullWidth
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              value={editForm.dateOfBirth}
              onChange={handleEditChange}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={editForm.gender}
                onChange={handleEditChange}
                label="Gender"
              >
                <MenuItem value="">—</MenuItem>
                {GENDERS.map((g) => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Workout type</InputLabel>
              <Select
                name="workoutType"
                value={editForm.workoutType}
                onChange={handleEditChange}
                label="Workout type"
              >
                {WORKOUT_TYPES.map((w) => (
                  <MenuItem key={w} value={w}>{w}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              name="emergencyContact"
              label="Emergency contact"
              value={editForm.emergencyContact}
              onChange={handleEditChange}
            />
            <TextField
              fullWidth
              name="notes"
              label="Notes"
              multiline
              rows={2}
              value={editForm.notes}
              onChange={handleEditChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleSaveEdit}
            loading={saving}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              background: 'linear-gradient(135deg, #1877F2 0%, #0C44AE 100%)',
            }}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
