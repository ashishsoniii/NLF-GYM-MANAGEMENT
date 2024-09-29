import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function AddPlanForm({ setClickedTitle }) {
  const [planData, setPlanData] = useState({
    name: '',
    duration: '',
    price: '',
    description: '',
  });

  const [errorshow, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanData({ ...planData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      // Retrieve the authentication token from local storage
      const token = localStorage.getItem('token');

      // Send POST request to add plan with authorization header
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/plan`, planData, {
        headers: {
          Authorization: `${token}`, // Include the token in the Authorization header
        },
      });

      console.log('Plan added successfully:', response.data);
      // Reset form fields after submission
      setPlanData({
        name: '',
        duration: '',
        price: '',
        description: '',
      });
      // Clear any previous errors
      setError('Plan Added Successfully');
      setClickedTitle('All Plans');
    } catch (error) {
      console.error('Error adding plan:', error);
      // Display error message
      setError(error.response.data.error);
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
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Add Plan
        </Button>
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
