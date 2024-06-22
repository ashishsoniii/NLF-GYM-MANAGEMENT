import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { Box, Stack, Container, Typography, Unstable_Grid2 as Grid } from '@mui/material';

import { AccountProfile } from 'src/sections/myAccount/account-profile';
// import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { AccountProfileDetails } from 'src/sections/myAccount/account-profile-details';

const acc = {
  _id: '66766b0a463074389ca06401',
  name: 'Ashish Soni',
  email: 'ashishsonii2002@gmail.com',
  phone: '9876565432',
  address: 'D234n',
  dateOfBirth: '2024-06-22T00:00:00.000Z',
  gender: 'Male',
  membershipPlan: '66766aed463074389ca063fa',
  joiningDate: '2024-06-22T00:00:00.000Z',
  expiryDate: '2024-12-22T00:00:00.000Z',
  latestPaymentDate: '2024-09-22T00:00:00.000Z',
  latestPaymentAmount: '7000',
  latestPlanName: 'Special Discount',
  payments: [
    {
      plan: {
        planId: '66766aed463074389ca063fa',
        name: 'Special Discount',
        duration: '3',
        price: 7000,
      },
      amount: 7000,
      date: '2024-06-22T06:11:20.336Z',
      joiningDate: '2024-06-22T00:00:00.000Z',
      expiryDate: '2024-09-22T00:00:00.000Z',
      paymentMethod: 'Cash',
      _id: '66766b0a463074389ca06402',
    },
    {
      plan: {
        planId: '66766aed463074389ca063fa',
        name: 'Special Discount',
        duration: '3',
        price: 7000,
      },
      amount: 7000,
      date: '2024-06-22T08:05:23.391Z',
      joiningDate: '2024-09-22T00:00:00.000Z',
      expiryDate: '2024-12-22T00:00:00.000Z',
      paymentMethod: 'Cash',
      _id: '667685c3bcccd35566eb96e6',
    },
  ],
  assignedTrainer: '6629ead5ebdf400ddbea7688',
  workoutType: 'Fitness',
  isActive: true,
  notes: '',
  __v: 1,
};

const AccountPage = ({ curentUser }) => (
  <>
    <Helmet>
      <title> User | GYM </title>
    </Helmet>

    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="lg" gap={3}>
        <Stack spacing={3}>
          <div>
            <Typography variant="h4">Account</Typography>
          </div>
          <div>
            <Grid container spacing={3}>
              <Grid xs={12} md={6} lg={4} my={3}>
                <AccountProfile curentUser={acc} />
              </Grid>
            </Grid>
            <AccountProfileDetails curentUser={acc} />
          </div>
        </Stack>
      </Container>
    </Box>
  </>
);

// AccountPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AccountPage;

AccountPage.propTypes = {
  curentUser: PropTypes.any,
};
