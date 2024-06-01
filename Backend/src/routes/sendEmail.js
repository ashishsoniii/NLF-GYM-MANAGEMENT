const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ashishsonii2002@gmail.com", // Replace with your Gmail email
        pass: "joxjqyeiyoutyzjd", // Replace with your Gmail app password
      },
    });

    const mailOptions = {
      from: "ashishsoni2002@gmail.com",
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};

const sendEmailwithAttachment = async (to, subject, html, attachment) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ashishsonii2002@gmail.com", // Replace with your Gmail email
        pass: "joxjqyeiwwwwwwwyoutyzjd", // Replace with your Gmail app password
      },
    });

    const mailOptions = {
      from: "ashishsoni2002@gmail.com",
      to,
      subject,
      html,
      attachments: attachment
        ? [{ filename: attachment.filename, content: attachment.content }]
        : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};

module.exports = { sendEmail, sendEmailwithAttachment };
