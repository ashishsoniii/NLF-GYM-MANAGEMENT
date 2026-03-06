/**
 * Beautiful email body: Payment received – PDF receipt attached.
 */
function paymentReceivedEmail({ name, planName, amount, expiryDate }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received</title>
</head>
<body style="margin:0; padding:0; background:#f0f4ff; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f4ff; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background:#ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(24, 119, 242, 0.12); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #1877F2 0%, #0C44AE 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin:0; color:#ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">Payment Received</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Thank you for your payment</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #1a202c; font-size: 16px; line-height: 1.5;">Hi <strong>${name}</strong>,</p>
              <p style="margin: 0 0 24px; color: #4a5568; font-size: 15px; line-height: 1.6;">Your payment has been received and reviewed. Your membership is now active.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Plan</p>
                    <p style="margin: 0; color: #1a202c; font-size: 16px; font-weight: 600;">${planName}</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Amount paid</p>
                    <p style="margin: 0; color: #1877F2; font-size: 20px; font-weight: 700;">₹ ${amount}</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Membership valid until</p>
                    <p style="margin: 0; color: #1a202c; font-size: 16px; font-weight: 600;">${expiryDate}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; color: #4a5568; font-size: 14px; line-height: 1.5;">📎 Your <strong>PDF receipt</strong> is attached to this email. Keep it for your records.</p>
              <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.5;">If you have any questions, reach out to us. We’re here to help!</p>
              <p style="margin: 24px 0 0; color: #1a202c; font-size: 15px; font-weight: 600;">— NLF Gym</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

module.exports = { paymentReceivedEmail };
