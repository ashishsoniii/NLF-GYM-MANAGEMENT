import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Grid,
  Dialog,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

function UserPaymentDialog({
  currentDataRow,
  isConfirmationEditOpen,
  setConfirmationEditOpen,
  id,
  fetchUsers,
}) {
  const [userData, setUserData] = useState({
    name: currentDataRow.name,
    planName: currentDataRow.latestPlanName,
    currentExpiryDate: currentDataRow.expiryDate,
    joiningDate: new Date(currentDataRow.expiryDate).toISOString().split('T')[0],
    membershipPlan: '',
    expiryDate: new Date(currentDataRow.expiryDate).toISOString().split('T')[0],
  });

  const [plans, setPlans] = useState([]);
  const [errorshow, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('http://localhost:3001/plan/active');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Error fetching plans');
    }
  };

  const calculateExpiryDate = (joiningDate, durationInMonths) => {
    const calculatedExpiry = new Date(joiningDate);
    calculatedExpiry.setMonth(calculatedExpiry.getMonth() + durationInMonths);
    return calculatedExpiry.toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (selectedPlan) {
      const durationInMonths = selectedPlan.duration;

      setUserData((prevState) => ({
        ...prevState,
        [name]: value,
        expiryDate: calculateExpiryDate(new Date(value), durationInMonths),
      }));
    } else {
      console.error('No plan selected');
      setError('Please select a membership plan first');
    }
  };

  const handlePlanChange = (e) => {
    const { value } = e.target;
    const currentSelectedPlan = plans.find((plan) => plan._id === value);

    if (currentSelectedPlan) {
      setSelectedPlan(currentSelectedPlan);
      const expiryDateUpdate = calculateExpiryDate(
        new Date(userData.joiningDate),
        currentSelectedPlan.duration
      );

      setUserData((prevState) => ({
        ...prevState,
        membershipPlan: value,
        latestPaymentAmount: currentSelectedPlan.price,
        expiryDate: expiryDateUpdate,
        planName: currentSelectedPlan.name,
      }));
    } else {
      console.error('Selected plan not found');
      setError('Selected plan not found');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddPayment = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const newPayment = {
        amount: selectedPlan.price,
        date: new Date(),
        paymentMethod: 'Cash',
        joiningDate: userData.joiningDate,
        expiryDate: userData.expiryDate,
        plan: {
          planId: selectedPlan._id,
          name: selectedPlan.name,
          duration: selectedPlan.duration,
          price: selectedPlan.price,
        },
      };

      const updatedUserData = {
        ...userData,
        latestPaymentDate: new Date(),
        latestPaymentAmount: selectedPlan.price,
        latestPlanName: selectedPlan.name,
        payments: [...currentDataRow.payments, newPayment],
      };

      await axios.put(`http://localhost:3001/member/modify/${id}`, updatedUserData, {
        headers: {
          Authorization: `${token}`,
        },
      });

      fetchUsers();
      console.log('Payment added successfully');
    } catch (error) {
      console.error('Error adding payment:', error);
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
      <DialogTitle id="alert-dialog-title">Add Payment</DialogTitle>
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
              disabled
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Current Plan"
              variant="outlined"
              fullWidth
              name="planName"
              value={userData.planName}
              onChange={handleChange}
              sx={{ mb: 2 }}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Current Expiry Date"
              variant="outlined"
              fullWidth
              name="currentExpiryDate"
              value={userData.currentExpiryDate.split('T')[0]}
              onChange={handleChange}
              sx={{ mb: 2 }}
              disabled
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="Select Plan"
              variant="outlined"
              fullWidth
              name="membershipPlan"
              value={userData.membershipPlan}
              onChange={(e) => {
                handleChange(e);
                handlePlanChange(e);
              }}
              sx={{ mb: 2 }}
            >
              {plans.map((plan) => (
                <MenuItem key={plan._id} value={plan._id}>
                  {plan.name}
                </MenuItem>
              ))}
            </TextField>
            {selectedPlan && (
              <Typography variant="body1" mx={2}>
                <strong>Name:</strong> {selectedPlan.name}, <strong>Duration:</strong>{' '}
                {selectedPlan.duration} months, <strong>Price:</strong> ₹{selectedPlan.price}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <TextField
              label="Joining Date"
              variant="outlined"
              fullWidth
              type="date"
              name="joiningDate"
              value={userData.joiningDate}
              onChange={handleDateChange}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <TextField
              label="Expiry Date"
              variant="outlined"
              fullWidth
              type="date"
              name="expiryDate"
              value={userData.expiryDate}
              disabled
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
        <Button onClick={handleAddPayment} color="primary">
          Add Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}

UserPaymentDialog.propTypes = {
  currentDataRow: PropTypes.object.isRequired,
  isConfirmationEditOpen: PropTypes.bool.isRequired,
  setConfirmationEditOpen: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  fetchUsers: PropTypes.func.isRequired,
};

export default UserPaymentDialog;
