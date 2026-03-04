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

function EditPlanDialog({
  isConfirmationEditOpen,
  setConfirmationEditOpen,
  name: initialName,
  id,
  description: initialDescription,
  duration: initialDuration,
  price: initialPrice,
  fetchPlans,
}) {
  const [planData, setPlanData] = useState({
    name: initialName,
    duration: initialDuration,
    price: initialPrice,
    description: initialDescription,
  });

  const [errorshow, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanData({ ...planData, [name]: value });
  };

  const handleEdit = async () => {
    try {
      await api.put(`/plan/${id}`, planData);
      fetchPlans();
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    }
    setConfirmationEditOpen(false);
  };

  return (
    <>
    {/* dialog */}
      <Dialog
        open={isConfirmationEditOpen}
        onClose={() => setConfirmationEditOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Edit Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={3}>
            <Grid item xs={12}>
              <TextField
                label="Plan Name"
                variant="outlined"
                fullWidth
                name="name"
                value={planData.name}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration (in months)"
                variant="outlined"
                fullWidth
                name="duration"
                value={planData.duration}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Price"
                variant="outlined"
                fullWidth
                name="price"
                value={planData.price}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                name="description"
                value={planData.description}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
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
    </>
  );
}

export default EditPlanDialog;

EditPlanDialog.propTypes = {
  setConfirmationEditOpen: PropTypes.func.isRequired,
  isConfirmationEditOpen: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  // status: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  fetchPlans: PropTypes.func.isRequired,
};
