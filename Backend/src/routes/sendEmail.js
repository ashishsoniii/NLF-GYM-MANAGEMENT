const nodemailer = require("nodemailer");

const CONNECTION_TIMEOUT_MS = 10000;
const GREETING_TIMEOUT_MS = 5000;

/** @returns {true | { sent: false, code: string }} */
const sendEmail = async (to, subject, html) => {
  const from = process.env.EMAIL || "noreply@nlfgym.com";
  const emailConfigured = !!process.env.EMAIL && !!process.env.EMAIL_PASSWORD;
  console.log("[sendEmail] Attempting to send email:", {
    to: to?.slice(0, 30),
    subject,
    from,
    emailConfigured,
    emailUser: process.env.EMAIL ? `${process.env.EMAIL.slice(0, 5)}...` : "(not set)",
  });

  if (!emailConfigured) {
    console.error("[sendEmail] EMAIL or EMAIL_PASSWORD env vars not set!");
    return { sent: false, code: "EMAIL_NOT_CONFIGURED" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log("[sendEmail] Email sent successfully:", { messageId: info.messageId, to: to?.slice(0, 30) });
    return true;
  } catch (error) {
    const code = error.code || "EMAIL_ERROR";
    const message = error.message || String(error);
    console.error("[sendEmail] Failed to send email:", {
      code,
      message,
      to: to?.slice(0, 30),
      subject,
      stack: error.stack?.split("\n").slice(0, 3).join(" | "),
    });
    return { sent: false, code };
  }
};

// const sendEmailwithAttachment = async (to, subject, html, attachment) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "ashishsonii2002@gmail.com", // Replace with your Gmail email
//         pass: "joxjqyeiyoutyzjd", // Replace with your Gmail app password
//       },
//     });

//     const mailOptions = {
//       from: "ashishsoni2002@gmail.com",
//       to,
//       subject,
//       html,
//       attachments: attachment
//         ? [{ filename: attachment.filename, content: attachment.content }]
//         : [],
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent: ", info.response);
//     return true;
//   } catch (error) {
//     console.error("Error sending email: ", error);
//     return false;
//   }
// };

/** @returns {true | { sent: false, code: string }} */
const sendEmailwithAttachment = async (to, subject, html, attachment) => {
  const from = process.env.EMAIL || "noreply@nlfgym.com";
  const emailConfigured = !!process.env.EMAIL && !!process.env.EMAIL_PASSWORD;
  const hasAttachment = !!attachment;
  console.log("[sendEmailWithAttachment] Attempting to send email:", {
    to: to?.slice(0, 30),
    subject,
    from,
    hasAttachment,
    emailConfigured,
    emailUser: process.env.EMAIL ? `${process.env.EMAIL.slice(0, 5)}...` : "(not set)",
  });

  if (!emailConfigured) {
    console.error("[sendEmailWithAttachment] EMAIL or EMAIL_PASSWORD env vars not set!");
    return { sent: false, code: "EMAIL_NOT_CONFIGURED" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments: attachment
        ? [{ filename: attachment.filename, content: attachment.content }]
        : [],
    });
    console.log("[sendEmailWithAttachment] Email sent successfully:", { messageId: info.messageId, to: to?.slice(0, 30) });
    return true;
  } catch (error) {
    const code = error.code || "EMAIL_ERROR";
    const message = error.message || String(error);
    console.error("[sendEmailWithAttachment] Failed to send email:", {
      code,
      message,
      to: to?.slice(0, 30),
      subject,
      stack: error.stack?.split("\n").slice(0, 3).join(" | "),
    });
    return { sent: false, code };
  }
};

module.exports = { sendEmail, sendEmailwithAttachment };
