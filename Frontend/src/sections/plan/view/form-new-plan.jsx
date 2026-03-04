import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import api from 'src/api/axios';


export default function AddPlanForm({ setClickedTitle }) {
  const [planData, setPlanData] = useState({
    name: '',
    duration: '',
    price: '',
    description: '',
  });

  const [errorshow, setError] = useState(null);
  const [loading, setLoading] = useState(false); // State to track loading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanData({ ...planData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/plan', planData);
      setPlanData({
        name: '',
        duration: '',
        price: '',
        description: '',
      });
      setError('Plan Added Successfully');
      setClickedTitle('All Plans');
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    }
    finally {
      setLoading(false); // Set loading to false when the login completes
    }
  };

  return (
    <Grid columnGap={1} item xs zeroMinWidth spacing={2} m={3}>
      <h1> Add New plan</h1>

      <Grid item xs={12} sm={6} md={6}>
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
      <Grid item xs={12} sm={6} md={3}>
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
      <Grid item xs={12} sm={6} md={3}>
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
      <Grid item xs={12} sm={6} md={6}>
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
      <Grid item xs={12} sm={6} md={3} mx={3}>
        <LoadingButton variant="contained" color="primary" onClick={handleSubmit} loading={loading}>
          Add Plan
        </LoadingButton>
        {errorshow && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {errorshow}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}

AddPlanForm.propTypes = {
  setClickedTitle: PropTypes.func,
};
