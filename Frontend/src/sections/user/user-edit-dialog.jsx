import axios from 'axios';
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
      const token = localStorage.getItem('token');

      // Send PUT request to edit the user
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/member/modify/${id}`, userData, {
        headers: {
          Authorization: `${token}`,
        },
      });

      // Refresh users after successful edit
      fetchUsers();
      console.log('User edited successfully:', response.data);
    } catch (error) {
      console.error('Error editing user:', error);
      setError(error.message);
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
