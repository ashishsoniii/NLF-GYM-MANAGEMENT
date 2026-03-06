/**
 * Beautiful onboarding email for new members – welcome, next steps, invoice attached.
 */
const newUser = ({
  name,
  email,
  phone,
  latestPlanName,
  latestPaymentAmount,
  joiningDate,
  expiryDate,
}) => {
  const planText = latestPlanName ? `You’re on the <strong>${latestPlanName}</strong> plan.` : "Your membership is active.";
  const validityText =
    joiningDate && expiryDate
      ? `Valid from <strong>${joiningDate}</strong> to <strong>${expiryDate}</strong>.`
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NLF Gym</title>
</head>
<body style="margin:0; padding:0; background:#f0f4ff; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f4ff; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background:#ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(24, 119, 242, 0.12); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #1877F2 0%, #0C44AE 100%); padding: 40px 40px; text-align: center;">
              <h1 style="margin:0; color:#ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.02em;">Welcome to NLF Gym</h1>
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">You’re in. Let’s get started.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1a202c; font-size: 17px; line-height: 1.5;">Hi <strong>${name}</strong>,</p>
              <p style="margin: 0 0 24px; color: #4a5568; font-size: 15px; line-height: 1.6;">Thank you for joining us. We’re excited to have you and will do our best to support your fitness journey.</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr><td style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Your details</td></tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr><td style="color: #1a202c; font-size: 14px;">📧 ${email}</td></tr>
                <tr><td style="color: #1a202c; font-size: 14px;">📱 ${phone || "—"}</td></tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr><td style="color: #1a202c; font-size: 14px;">${planText}</td></tr>
                ${validityText ? `<tr><td style="color: #4a5568; font-size: 14px; padding-top: 4px;">${validityText}</td></tr>` : ""}
                ${latestPaymentAmount ? `<tr><td style="color: #1877F2; font-size: 16px; font-weight: 700; padding-top: 8px;">Amount paid: ₹ ${latestPaymentAmount}</td></tr>` : ""}
              </table>

              <p style="margin: 0 0 12px; color: #1a202c; font-size: 15px; font-weight: 600;">What’s next?</p>
              <ul style="margin: 0 0 24px; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                <li>Visit the member portal to view your profile and membership.</li>
                <li>Bring a valid ID on your first visit.</li>
                <li>If you have any questions, reach out to us – we’re here to help.</li>
              </ul>

              <p style="margin: 0 0 8px; color: #4a5568; font-size: 14px;">📎 Your <strong>invoice</strong> is attached to this email for your records.</p>
              <p style="margin: 0; color: #4a5568; font-size: 14px;">We look forward to seeing you at the gym.</p>

              <p style="margin: 28px 0 0; color: #1a202c; font-size: 15px; font-weight: 600;">— The NLF Gym Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

module.exports = { newUser };
