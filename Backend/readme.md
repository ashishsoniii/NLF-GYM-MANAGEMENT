# User Registration and Authentication API

This API allows users to register, verify their email using OTP, and authenticate using a secure JWT token.

## Getting Started

### Prerequisites

- Node.js installed on your machine
- MongoDB database set up
- Install nodemon as dev dependency

` nodemon`

### Installation

1. Clone the repository:

### The API will run on http://localhost:3000 by default.

API Routes

## Register User

Endpoint: /register

Method: POST

Parameters:

```
{
  "collegeEmail": "john.doe@example.com",
}
```

Sample Response (Success):

```
{
  "message": "User registered. A random password has been sent to your College Email."
  }
```

Sample Response (Error):

```
{
  "error": "Please enter a valid College Email address. Contact the admin if the email is correct."

}
```

## Verify Password - first timer

Endpoint: /verify-password

Method: POST

Parameters:

```
{
  "collegeEmail": "john.doe@example.com",
  "password": "recieved on email - college email"
}
```

Sample Response (Success):

```

{
  "token": "<jwt-token>",
  "message": "Password verified. User marked as verified."
}


```

Sample Response (Error):

```
{
  "error": "Password verification failed."
}

```

## User Login

Endpoint: /login

Method: POST

```
{
  "collegeEmail": "john.doe@example.com",
  "password": "password123"
}
```

Sample Response (Success):

```
{
  "token": "<jwt-token>"
}
```

Sample Response (Error):

```
{
  "error": "Account is unverified. Please check your College Email for OTP."
}
```

## Verify OTP -- no use atleast for now!## User Login

Endpoint: /login

Method: POST

```
{
  "collegeEmail": "john.doe@example.com",
  "password": "password123"
}
```

Sample Response (Success):

```
{
  "token": "<jwt-token>"
}
```

Sample Response (Error):

```
{
  "error": "Account is unverified. Please check your College Email for OTP."
}
```



Endpoint: /verify-otp

Method: POST

Parameters:

```
{
  "collegeEmail": "john.doe@example.com",
  "otp": "1234"
}
```

```
{
  "token": "<jwt-token>",
  "message": "OTP verified successfully."
}
```

Sample Response (Error):

```
{
  "error": "OTP verification failed."
}
```

### User Logout (impleament using frontend)

Endpoint: /logout

Method: POST

Sample Response (Success):

```
{
  "message": "Logout successful."
}

```

License
