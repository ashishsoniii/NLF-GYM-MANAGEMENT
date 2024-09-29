import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';

export default function SendEmailForm({ setClickedTitle }) {
  const [emailData, setEmailData] = useState({
    emailOption: 'everyone',
    customEmails: '',
    name: '',
    email: '',
    subject: '',
    content: '',
  });

  const [errorShow, setErrorShow] = useState(null);
  const [loading, setLoading] = useState(false); // State to track loading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData({ ...emailData, [name]: value });
  };

  const handleEmailOptionChange = (e) => {
    setEmailData({ ...emailData, emailOption: e.target.value });
  };

  const handleCustomEmailsChange = (e) => {
    setEmailData({ ...emailData, customEmails: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/member/sendEmail`, emailData, {
        headers: {
          Authorization: `${token}`,
        },
      });

      console.log('Email sent successfully:', response.data);
      setEmailData({
        emailOption: 'everyone',
        customEmails: '',
        name: '',
        email: '',
        subject: '',
        content: '',
      });
      setErrorShow('Email sent successfully');
      setClickedTitle('All Email');
    } catch (error) {
      console.error('Error sending email:', error);
      setErrorShow(error.response?.data?.error || 'Error sending email');
    } finally {
      setLoading(false); // Set loading to false when the login completes
    }
  };

  return (
    <Grid columnGap={1} item xs zeroMinWidth spacing={2} m={3}>
      <h1> Add New plan</h1>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Email Option</InputLabel>
          <Select
            value={emailData.emailOption}
            onChange={handleEmailOptionChange}
            label="Email Option"
          >
            <MenuItem value="everyone">Everyone</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {emailData && emailData.emailOption === 'custom' && (
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Custom Emails"
            variant="outlined"
            fullWidth
            name="customEmails"
            value={emailData.customEmails}
            onChange={handleCustomEmailsChange}
            placeholder="Enter emails separated by commas"
            sx={{ mb: 2 }}
          />
        </Grid>
      )}
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          label="subject"
          variant="outlined"
          fullWidth
          name="subject"
          value={emailData.subject}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <TextField
          label="content"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          name="content"
          value={emailData.content}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3} mx={3}>
        <LoadingButton variant="contained" color="primary" onClick={handleSubmit} loading={loading}>
          Send Email
        </LoadingButton>
        {errorShow && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {errorShow}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}

SendEmailForm.propTypes = {
  setClickedTitle: PropTypes.func,
};
