import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { Box, Stack, Container, Typography, Unstable_Grid2 as Grid } from '@mui/material';

import { AccountProfile } from 'src/sections/account/account-profile';
// import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { AccountProfileDetails } from 'src/sections/account/account-profile-details';

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
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <div>
            <Typography variant="h4">Account</Typography>
          </div>
          <div>
            <Grid container spacing={3} >
              <Grid xs={12} md={6} lg={4}>
                <AccountProfile curentUser={curentUser} />
              </Grid>
            </Grid>
            <AccountProfileDetails curentUser={curentUser} />
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
