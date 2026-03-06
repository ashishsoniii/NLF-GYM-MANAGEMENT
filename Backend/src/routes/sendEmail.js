const nodemailer = require("nodemailer");

const CONNECTION_TIMEOUT_MS = 10000;
const GREETING_TIMEOUT_MS = 5000;

/** @returns {true | { sent: false, code: string }} */
const sendEmail = async (to, subject, html) => {
  const from = process.env.EMAIL || "noreply@nlfgym.com";
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
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    const code = error.code || "EMAIL_ERROR";
    const message = error.message || String(error);
    console.error("Error sending email:", { code, message, to: to?.slice(0, 20) + "..." });
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
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    const code = error.code || "EMAIL_ERROR";
    const message = error.message || String(error);
    console.error("Error sending email:", { code, message, to: to?.slice(0, 20) + "..." });
    return { sent: false, code };
  }
};

module.exports = { sendEmail, sendEmailwithAttachment };
