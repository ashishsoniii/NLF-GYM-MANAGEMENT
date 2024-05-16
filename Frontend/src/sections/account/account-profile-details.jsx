import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import {
  Box,
  Card,
  Divider,
  TextField,
  CardHeader,
  CardContent,
  CardActions,
  Unstable_Grid2 as Grid,
} from '@mui/material';

import PlanPage from './plan/view/plan-view';

// const user = window.sessionStorage.getItem("user");

export const AccountProfileDetails = ({ curentUser }) => {
  console.log(curentUser);
  console.log(curentUser);
  console.log(curentUser);
  const [values, setValues] = useState({
    name: curentUser.name,
    phone: curentUser.phone,
    email: curentUser.email,
    address: curentUser.address,
    joiningDate: curentUser.joiningDate,
    expiryDate: curentUser.expiryDate,
    latestPlanName: curentUser.latestPlanName,
    latestPaymentDate: curentUser.latestPaymentDate,
    membershipPlan: curentUser.membershipPlan,
    payments: curentUser.payments,
    workoutType: curentUser.workoutType,
  });

  const handleChange = useCallback((event) => {
    setValues((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  }, []);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Please contact admin if your details are wrong" title="Profile" />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: 1.5 }}>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  // helperText="Please specify the first name"
                  label="Name"
                  name="name"
                  onChange={handleChange}
                  required
                  // disabled
                  value={values.name}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  onChange={handleChange}
                  // required
                  // disabled
                  value={values.email}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  onChange={handleChange}
                  value={values.phone}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="joiningDate"
                  name="joiningDate"
                  onChange={handleChange}
                  disabled
                  value={values.joiningDate}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="expiryDate"
                  name="expiryDate"
                  onChange={handleChange}
                  disabled
                  value={values.expiryDate}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="latestPlanName"
                  name="latestPlanName"
                  onChange={handleChange}
                  disabled
                  value={values.latestPlanName}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="latestPaymentDate."
                  name="latestPaymentDate"
                  onChange={handleChange}
                  disabled
                  value={values.latestPaymentDate}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="membershipPlan"
                  name="membershipPlan"
                  onChange={handleChange}
                  disabled
                  value={values.membershipPlan}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="address"
                  name="address"
                  onChange={handleChange}
                  disabled
                  value={values.address}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>


        <Divider />
        <PlanPage payments={values.payments} />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          {/* <Button variant="contained">Save details</Button> */}
        </CardActions>
      </Card>
    </form>
  );
};

AccountProfileDetails.propTypes = {
  curentUser: PropTypes.any,
};
