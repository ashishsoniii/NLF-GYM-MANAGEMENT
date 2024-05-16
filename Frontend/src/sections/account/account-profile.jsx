import React, { useState } from "react";

import {
  Box,
  Card,
  Avatar,
  Button,
  Divider,
  Typography,
  CardContent,
  CardActions,
} from "@mui/material";

export const AccountProfile = () => {
  // We'll keep user data in state to update it once we can access the window object.
  const [user, ] = useState({
    avatar: "/assets/images/avatars/avatar_1.jpg", // Default avatar path
    city: "Los Angeles",
    country: "USA",
    jobTitle: "Senior Developer",
    name: "Name Here", // Placeholder for name until we fetch data
    timezone: "GTM-7",
  });

  // useEffect will run this code once the component is mounted in the client (where window is defined).
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const storedUserData = window.sessionStorage.getItem("user");
  //     if (storedUserData) {
  //       const userData = JSON.parse(storedUserData);
  //       // Now we can safely access userData and update the state.
  //       setUser((prevUser) => ({
  //         ...prevUser,
  //         name: userData.name, // assuming 'name' is a property of your stored user object
  //         email: userData.email, // assuming 'name' is a property of your stored user object
  //         lastLogin : userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'Never'


  //         // You can add any other properties from userData that you need.
  //       }));
  //     }
  //   }
  // }, []); // Empty dependency array means this useEffect runs once when component is mounted.

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Avatar
            src={user.avatar}
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
