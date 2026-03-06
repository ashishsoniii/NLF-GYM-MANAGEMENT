import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';

import api from 'src/api/axios';

export default function DeleteAdminDialog({ open, onClose, onSuccess, admin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleDelete = async () => {
    if (!admin?._id) return;
    setLoading(true);
    setError('');
    try {
      await api.delete(`/auth/admins/${admin._id}`);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete admin');
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete admin</DialogTitle>
      <DialogContent>
        <Typography>
          Delete <strong>{admin.name || admin.email}</strong>? This cannot be undone.
        </Typography>
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton color="error" variant="contained" loading={loading} onClick={handleDelete}>
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

DeleteAdminDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  admin: PropTypes.object,
};
