import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';

import api from 'src/api/axios';

export default function ResetAdminPasswordDialog({ open, onClose, onSuccess, admin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleClose = () => {
    setNewPassword('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!admin?._id) return;
    if (!newPassword.trim()) {
      setError('New password is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post(`/auth/admins/${admin._id}/reset-password`, { newPassword: newPassword.trim() });
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reset password — {admin.name || admin.email}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          type="password"
          label="New password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError('');
          }}
          sx={{ mt: 1 }}
        />
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton variant="contained" loading={loading} onClick={handleSubmit}>
          Reset password
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

ResetAdminPasswordDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  admin: PropTypes.object,
};
