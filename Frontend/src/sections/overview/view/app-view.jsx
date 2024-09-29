import axios from 'axios';
import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

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
  console.log(gymStatistics);
  console.log(gymStatistics);
  console.log(gymStatistics);
  console.log(gymStatistics);

  const [incomeData, setIncomeData] = useState([]);
  const year = 2024; // Replace with dynamic year if needed

  useEffect(() => {
    const fetchStatsCard = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/stat/statistics`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setGymStatistics(data);
      } catch (error) {
        console.error('Error fetching income data:', error);
      }
    };

    fetchStatsCard();
  }, [year]);
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/stat/income/${year}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setIncomeData(data);
      } catch (error) {
        console.error('Error fetching income data:', error);
      }
    };

    fetchIncomeData();
  }, [year]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/stat/members/chart-data`);
        setChartData(response.data);
      } catch (error) {
        console.error('Error fetching MLE statistics:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchDataMFStat = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/stat/members/mle-statistics`);
        setMleStatistics(response.data.series);
      } catch (error) {
        console.error('Error fetching chart data:', error);
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
