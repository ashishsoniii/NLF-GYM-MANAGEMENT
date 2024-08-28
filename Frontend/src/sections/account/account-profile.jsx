import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Avatar,
  Button,
  Divider,
  Typography,
  CardContent,
  CardActions,
} from '@mui/material';

const bufferToBase64 = (buffer) => {
  if (!buffer || !buffer.data || buffer.data.length === 0) {
    console.error('Buffer is empty or invalid.');
    return ''; // or return a default placeholder image URL
  }

  try {
    const uint8Array = new Uint8Array(buffer.data);
    const base64String = btoa(String.fromCharCode(...uint8Array));
    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error('Error converting buffer to base64:', error);
    return ''; // or return a default placeholder image URL
  }
};





export const AccountProfile = ({ curentUser }) => {


  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (curentUser.profileImage) {
      // Convert buffer data to base64 and set it to state
      const base64String = bufferToBase64(curentUser.profileImage);
      setImageSrc(base64String);
    }
  }, [curentUser.profileImage]);

  // We'll keep user data in state to update it once we can access the window object.
  const [user, setUser] = useState({
    avatar: curentUser.profileImage, // Default avatar path
    //     avatar: curentUser.profileImage || '/assets/images/avatars/avatar_1.jpg', // Default avatar path

    city: curentUser.phone,
    country: 'USA',
    jobTitle: 'Senior Developer',
    name: curentUser.name, // Placeholder for name until we fetch data
    timezone: 'GMT-5:30',
  });

  useEffect(() => {
    setUser({
      avatar: curentUser.profileImage, // Default avatar path
      //     avatar: curentUser.profileImage || '/assets/images/avatars/avatar_1.jpg', // Default avatar path
  
      city: curentUser.phone,
      country: 'USA',
      jobTitle: 'Senior Developer',
      name: curentUser.name, // Placeholder for name until we fetch data
      timezone: 'GMT-5:30',
      });
  }, [curentUser]);

  return (
    <Card>
      <CardContent>
      
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Avatar
            src={imageSrc}
            sx={{
              height: 80,
              mb: 2,
              width: 80,
            }}
          />
          <Typography gutterBottom variant="h5">
            {user.name}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {user.city}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {user.lastLogin}
          </Typography>
        </Box>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          Upload picture
        </Button>
      </CardActions>
    </Card>
  );
};

AccountProfile.propTypes = {
  curentUser: PropTypes.any,
};
