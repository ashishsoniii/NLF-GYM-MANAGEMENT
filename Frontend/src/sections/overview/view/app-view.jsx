import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import api from 'src/api/axios';

import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppConversionRates from '../app-conversion-rates';

export default function AppView() {
  const [chartData, setChartData] = useState({
    labels: [],
    series: [],
  });
  const [mleStatistics, setMleStatistics] = useState([]);
  const [gymStatistics, setGymStatistics] = useState(null);
  const [incomeData, setIncomeData] = useState([]);
  const year = 2024;

  useEffect(() => {
    const fetchStatsCard = async () => {
      try {
        const response = await api.get('/stat/statistics');
        setGymStatistics(response.data);
      } catch (error) {
        // Handled by api interceptor
      }
    };
    fetchStatsCard();
  }, []);

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const response = await api.get(`/stat/income/${year}`);
        setIncomeData(response.data);
      } catch (error) {
        // Handled by api interceptor
      }
    };
    fetchIncomeData();
  }, [year]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/stat/members/chart-data');
        setChartData(response.data);
      } catch (error) {
        // Handled by api interceptor
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDataMFStat = async () => {
      try {
        const response = await api.get('/stat/members/mle-statistics');
        setMleStatistics(response.data.series);
      } catch (error) {
        // Handled by api interceptor
      }
    };
    fetchDataMFStat();
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          {gymStatistics && (
            <AppWidgetSummary
              title="Current Income"
              total={gymStatistics.currentMonthIncome}
              color="success"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
            />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          {gymStatistics && (
            <AppWidgetSummary
              title="Joined This Month"
              total={gymStatistics.joinedThisMonthCount}
              color="info"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
            />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={3}>
         {gymStatistics &&  <AppWidgetSummary
            title="Active Members"
            total={gymStatistics.activeMembersCount}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />}
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          {gymStatistics && (
            <AppWidgetSummary
              title="Total Plans"
              total={gymStatistics.totalPlansCount}
              color="error"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
            />
          )}
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Member Info"
            subheader="Detailed Info"
            chart={{
              labels: chartData.labels,
              series: chartData.series,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Current Visits"
            chart={{
              series: mleStatistics.map((stat) => ({ label: stat.label, value: stat.value })),
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppConversionRates
            title="Monthly Income"
            subheader="Income Earned per month - year 2024 "
            chart={{
              series: incomeData.map((monthData) => ({
                label: monthData.label,
                value: monthData.value,
              })),
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
