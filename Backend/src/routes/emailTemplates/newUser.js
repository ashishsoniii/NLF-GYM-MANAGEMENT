const newUser = ({name,email,phone,latestPlanName, latestPaymentAmount,joiningDate,expiryDate }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #333333;
      }
      p {
        color: #666666;
      }
    </style>
    </head>
    <body>
      <div class="container">
        <h1>Payment Confirmation</h1>
        <p>Hi <strong> ${name} </strong>,</p>
        <p>Thank you for your payment! Here are the details:</p>
        <ul>
          <li><strong>Name:</strong>  ${name} </li>
          <li><strong>Email:</strong> ${email} </li>
          <li><strong>Phone Number:</strong>  ${phone}</li>
          <li><strong>Plan Name:</strong> ${latestPlanName} </li>
          <li><strong>Payment Amount:</strong> ${latestPaymentAmount} Rs.</li>
          <li><strong>Start Date:</strong>  ${joiningDate}</li>
          <li><strong>End Date:</strong>  ${expiryDate} </li>
          <li><strong>Validity:</strong>  ${"validityP"} Months</li>
        </ul>
        <p>Your invoice is attached to this email!</p>
    
        <p>Thank you for choosing No Limits Fitness. You are now part of our fitness community!</p>
        <p>We are excited to help you achieve your health and fitness goals. Our team will review your goals and create a personalized plan that suits your needs.</p>
        <p>If you have any questions or need assistance, please feel free to reach out to us at <strong>9982482431</strong>.</p>
        <p>Congratulations on taking the step towards a healthier you. We are proud to be part of your fitness journey!</p>
        <p>We look forward to witnessing your progress and success!</p>
        <p><strong>Mahendra Yadav</strong><br>(Your Fitness Coach)</p>
      </div>
    </body>
    </html>
        
`;
};

module.exports = {
  newUser,
};
