# NLF Gym Management WebApp

## Introduction

NLF Gym Management WebApp is a comprehensive solution built using the MERN stack (MongoDB, Express.js, React, Node.js) designed to manage gym operations efficiently. The application features a robust dashboard, user management, plan management, email tracking, and account management functionalities.

## Features

1. **Dashboard**: Provides analytics about gym members including current members, new members joined this month, active members, total available plans, and displays graphs, pie charts, and monthly income details.
2. **User Management**: Allows gym owners to manage gym members, view expired memberships, apply filters, search users, view and update user profiles, and manage memberships.
3. **Plan Management**: Enables gym owners to add new plans, set pricing, and manage plan details.
4. **Email Management**: Tracks emails sent to users and allows sending updates to all users or individually.
5. **Account Management**: Allows gym owners to view and update their profile, and change their password.

## Table of Contents

1. [Dashboard](#dashboard)
2. [User Management](#user-management)
3. [Plan Management](#plan-management)
4. [Email Management](#email-management)
5. [Account Management](#account-management)
6. [Installation](#installation)
7. [Usage](#usage)

## Dashboard

The Dashboard provides an overview of the gym's performance and member activity:

- **Current Members**: Displays the total number of active gym members.
- **Joined This Month**: Shows the number of new members who joined in the current month.
- **Active Members**: Highlights the number of members actively using the gym services.
- **Total Available Plans**: Lists the number of membership plans available.
- **Graphs and Pie Charts**: Visual representations of membership trends, demographics, and income statistics.
- **Monthly Income**: Detailed display of the gym's income for the current month.

## User Management

The User Management section allows the gym owner to oversee all gym members, referred to as "gymbees":

- **All Users**: View all registered members, search for specific users, and filter users based on various criteria.
- **Expired Memberships**: Filter and categorize users with expired memberships to create targeted promotions.
- **User Profiles**: Detailed profiles for each gymbee, including:
  - Add payments
  - Activate or deactivate memberships
  - Edit user details
  - Update membership status
  - Delete users

## Plan Management

The Plan Management section enables the gym owner to manage membership plans:

- **Add New Plans**: Create new membership plans with pricing and other relevant details.
- **Manage Plans**: Edit or delete existing plans as needed.

## Email Management

The Email Management section tracks and manages communication with gym members:

- **Track Emails**: Monitor all emails sent to users.
- **Send Emails**: Send updates and notifications to all users collectively or individually.

## Account Management

The Account Management section allows the gym owner to manage their profile:

- **View Profile**: Display the gym owner's profile details.
- **Edit Profile**: Update personal information and change the password.

## Installation

To run the NLF Gym Management WebApp locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/NLF-gym-management-webapp.git

2. Navigate to the project directory:
    ```
    cd NLF-gym-management-webapp
    ```
3. Install dependencies for both the backend and frontend:
    ```
    cd Backend
    npm install
    cd ../Frontend
    npm install

    ```

4. Set up environment variables. Create a .env file in the backend directory with the following content:
    ```
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```

5. Start the backend server:
    ```
    cd Backend
    npm run dev
    ```
6. Start the Frontend Server
    ```
    cd Frontend
    npm run dev
    ```

## Usage

The NLF Gym Management WebApp is a web application that allows gym owners to manage their gym's
1. Navigate to the application in your browser:
    ```
    http://localhost:3030
    ``` 

2. Log in with your credentials.
3. Use the navigation menu to access different sections:
    - Dashboard
    - Users
    - Plans
    - Emails
    - My Account
