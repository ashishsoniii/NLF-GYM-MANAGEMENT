import PropTypes from 'prop-types';
import React, { useState } from 'react';

import {
  Grid,
  Dialog,
  Button,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import api from 'src/api/axios';

function UserEditDialog({
  isConfirmationEditOpen,
  setConfirmationEditOpen,
  name: initialName,
  id,
  email: initialEmail,
  phone: initialPhone,
  gender: initialGender,
  role: initialRole,
  fetchUsers,
}) {
  const [userData, setUserData] = useState({
    name: initialName,
    email: initialEmail,
    phone: initialPhone,
    gender: initialGender,
    role: initialRole,
  });

  const [errorshow, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleEdit = async () => {
    try {
      await api.put(`/member/modify/${id}`, userData);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    }

    setConfirmationEditOpen(false);
  };

  return (
    <Dialog
      open={isConfirmationEditOpen}
      onClose={() => setConfirmationEditOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Edit User</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={3}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              name="name"
              value={userData.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              name="email"
              value={userData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone"
              variant="outlined"
              fullWidth
              name="phone"
              value={userData.phone}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Gender"
              variant="outlined"
              fullWidth
              name="gender"
              value={userData.gender}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>
          {/* <Grid item xs={12}>
            <TextField
              label="Role"
              variant="outlined"
              fullWidth
              name="role"
              value={userData.role}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid> */}
          <Grid item xs={12}>
            {errorshow && (
              <Typography variant="body2" color="error">
                {errorshow}
              </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmationEditOpen(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={handleEdit} color="primary">
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

UserEditDialog.propTypes = {
  setConfirmationEditOpen: PropTypes.func.isRequired,
  isConfirmationEditOpen: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  phone: PropTypes.string.isRequired,
  gender: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  fetchUsers: PropTypes.func.isRequired,
};

export default UserEditDialog;
