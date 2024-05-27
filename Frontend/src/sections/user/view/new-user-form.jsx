import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function NewUserForm({ setClickedTitle }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    membershipPlan: '',
    dateOfBirth: new Date().toISOString().slice(0, 10).split('T')[0], // Date format: dd-mm-yyyy
    gender: '',
    latestPlanName: '',
    joiningDate: new Date().toISOString().slice(0, 10).split('T')[0], // Default to current date
    expiryDate: new Date().toISOString().slice(0, 10).split('T')[0],
    latestPaymentDate: new Date().toISOString().slice(0, 10).split('T')[0], // Default to current date
    payments: [],
    assignedTrainer: '6629ead5ebdf400ddbea7688', // default is no one and is self!
    workoutType: 'Fitness',
    latestPaymentAmount: 0,
    isActive: true,
    notes: '',
  });

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch plans from backend when component mounts
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('http://localhost:3001/plan/active');
      setPlans(response.data);
    } catch (errors) {
      console.error('Error fetching plans:', errors);
      setError('Error fetching plans');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const calculateExpiryDate = (joiningDate, durationInMonths) => {
    // Create a copy of the joiningDate
    const calculatedExpiry = new Date(joiningDate);
    calculatedExpiry.setMonth(calculatedExpiry.getMonth() + durationInMonths);
    return calculatedExpiry.toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (userData.membershipPlan) {
      const currentSelectedPlan = plans.find((plan) => plan._id === userData.membershipPlan);
      const durationInMonths = currentSelectedPlan.duration;

      setUserData({
        ...userData,
        [name]: value, // joiningDate
        expiryDate: calculateExpiryDate(new Date(value), durationInMonths),
      });
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
      console.log(currentSelectedPlan);

      // Ensure joiningDate is in the correct format (YYYY-MM-DD)
      const formattedJoiningDate = userData.joiningDate.split('T')[0];

      // payments: [
      //   {
      //     amount: { type: Number, required: true },
      //     date: { type: Date, default: Date.now },
      //     paymentMethod: {
      //       type: String,
      //       enum: ["Cash", "Card", "Online"],
      //       required: true,
      //     },
      //     plan: {
      //       planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
      //       name: String,
      //       duration: String,
      //       price: Number,
      //     },
      //   },
      // ],

      const expiryDateUpdate = calculateExpiryDate(
        new Date(formattedJoiningDate),
        currentSelectedPlan.duration
      );

      const payments = [
        {
          amount: currentSelectedPlan.price,
          date: new Date(),
          paymentMethod: 'Cash',
          joiningDate: userData.joiningDate,
          expiryDate: expiryDateUpdate,
          plan: {
            planId: currentSelectedPlan._id, // Example ObjectId as a string
            name: currentSelectedPlan.name,
            duration: currentSelectedPlan.duration,
            price: currentSelectedPlan.price,
          },
        },
      ];

      console.log('Initial payments:', payments);

      setUserData({
        ...userData,
        membershipPlan: value,
        latestPaymentAmount: currentSelectedPlan.price,
        expiryDate: expiryDateUpdate,
        latestPlanName: currentSelectedPlan.name,
        payments,
      });
    } else {
      console.error('Selected plan not found');
      setError('Selected plan not found');
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(userData);
      console.log(userData);
      const response = await axios.post('http://localhost:3001/member/add', userData, {
        headers: {
          Authorization: token,
        },
      });
      console.log(userData);
      console.log(userData);
      console.log('User added successfully:', response.data);
      setUserData({
        name: '',
        email: '',
        phone: '',
        address: '',
        membershipPlan: '',
        dateOfBirth: new Date().toISOString().slice(0, 10).split('T')[0], // Date format: dd-mm-yyyy
        gender: '',
        latestPlanName: '',
        joiningDate: new Date().toISOString().slice(0, 10).split('T')[0], // Default to current date
        expiryDate: new Date().toISOString().slice(0, 10).split('T')[0],
        latestPaymentDate: new Date().toISOString().slice(0, 10).split('T')[0], // Default to current date
        payments: [],
        assignedTrainer: '6629ead5ebdf400ddbea7688',
        workoutType: 'Fitness',
        isActive: true,
        notes: '',
      });
      setSelectedPlan(null);
      setError('User Added Successfully');
      setClickedTitle('All Users');
    } catch (errors) {
      console.error('Error adding user:', errors);
      setError(errors.response.data.error);
    }
  };

  return (
    <Grid columnGap={1} item xs zeroMinWidth spacing={2} m={3}>
      <h1> Add New User</h1>
      <Grid item xs={12} sm={6} md={6}>
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
      <Grid item xs={12} sm={6} md={6}>
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
      <Grid item xs={12} sm={6} md={6}>
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
      <Grid item xs={12} sm={6} md={6}>
        <TextField
          label="Address"
          variant="outlined"
          fullWidth
          name="address"
          value={userData.address}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={6}>
        <TextField
          label="Date of Birth"
          variant="outlined"
          type="date"
          fullWidth
          name="dateOfBirth"
          value={userData.dateOfBirth}
          onChange={handleDateChange}
          sx={{ mb: 2 }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <TextField
          select
          label="Gender"
          variant="outlined"
          fullWidth
          name="gender"
          value={userData.gender}
          onChange={handleChange}
          sx={{ mb: 2 }}
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6} md={6}>
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

      <Grid item xs={12} sm={6} md={6} my={2}>
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

      {/* Add more fields (joiningDate, expiryDate, latestPaymentDate, etc.) as needed */}
      <Grid item xs={12} sm={6} md={3} mx={3}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Add User
        </Button>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}

NewUserForm.propTypes = {
  setClickedTitle: PropTypes.func,
};
