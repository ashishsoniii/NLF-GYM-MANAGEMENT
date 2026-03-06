const nodemailer = require("nodemailer");

const CONNECTION_TIMEOUT_MS = 10000;
const GREETING_TIMEOUT_MS = 5000;

const useBrevo = !!process.env.BREVO_API_KEY;

function getProvider() {
  if (useBrevo) return "Brevo";
  return "Gmail SMTP";
}

/** @returns {true | { sent: false, code: string }} */
const sendEmail = async (to, subject, html) => {
  const from = process.env.EMAIL_FROM || process.env.EMAIL || "noreply@nlfgym.com";
  const fromName = process.env.EMAIL_FROM_NAME || "NLF Gym";

  console.log("[sendEmail] Attempting to send email:", {
    to: to?.slice(0, 30),
    subject,
    from,
    provider: getProvider(),
  });

  if (useBrevo) return sendViaBrevo(to, subject, html, from, fromName);
  return sendViaGmail(to, subject, html, from);
};

/** @returns {true | { sent: false, code: string }} */
const sendEmailwithAttachment = async (to, subject, html, attachment) => {
  const from = process.env.EMAIL_FROM || process.env.EMAIL || "noreply@nlfgym.com";
  const fromName = process.env.EMAIL_FROM_NAME || "NLF Gym";
  const hasAttachment = !!attachment;

  console.log("[sendEmailWithAttachment] Attempting to send email:", {
    to: to?.slice(0, 30),
    subject,
    from,
    hasAttachment,
    provider: getProvider(),
  });

  if (useBrevo) return sendViaBrevo(to, subject, html, from, fromName, attachment);
  return sendViaGmailWithAttachment(to, subject, html, from, attachment);
};

async function sendViaBrevo(to, subject, html, from, fromName, attachment = null) {
  try {
    const payload = {
      sender: { email: from, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    if (attachment) {
      const content = Buffer.isBuffer(attachment.content)
        ? attachment.content.toString("base64")
        : attachment.content;
      payload.attachment = [{ name: attachment.filename, content }];
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[sendEmail:Brevo] API error:", data);
      return { sent: false, code: data.code || "BREVO_ERROR" };
    }

    console.log("[sendEmail:Brevo] Email sent successfully:", { messageId: data.messageId, to: to?.slice(0, 30) });
    return true;
  } catch (error) {
    const code = error.code || "BREVO_ERROR";
    const message = error.message || String(error);
    console.error("[sendEmail:Brevo] Failed:", { code, message, to: to?.slice(0, 30), subject });
    return { sent: false, code };
  }
}

async function sendViaGmail(to, subject, html, from) {
  const emailConfigured = !!process.env.EMAIL && !!process.env.EMAIL_PASSWORD;
  if (!emailConfigured) {
    console.error("[sendEmail:Gmail] EMAIL or EMAIL_PASSWORD env vars not set!");
    return { sent: false, code: "EMAIL_NOT_CONFIGURED" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
    });

    const info = await transporter.sendMail({ from, to, subject, html });
    console.log("[sendEmail:Gmail] Email sent successfully:", { messageId: info.messageId, to: to?.slice(0, 30) });
    return true;
  } catch (error) {
    const code = error.code || "EMAIL_ERROR";
    const message = error.message || String(error);
    console.error("[sendEmail:Gmail] Failed:", {
      code, message, to: to?.slice(0, 30), subject,
      stack: error.stack?.split("\n").slice(0, 3).join(" | "),
    });
    return { sent: false, code };
  }
}

async function sendViaGmailWithAttachment(to, subject, html, from, attachment) {
  const emailConfigured = !!process.env.EMAIL && !!process.env.EMAIL_PASSWORD;
  if (!emailConfigured) {
    console.error("[sendEmailWithAttachment:Gmail] EMAIL or EMAIL_PASSWORD env vars not set!");
    return { sent: false, code: "EMAIL_NOT_CONFIGURED" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
    });

    const info = await transporter.sendMail({
      from, to, subject, html,
      attachments: attachment ? [{ filename: attachment.filename, content: attachment.content }] : [],
    });
    console.log("[sendEmailWithAttachment:Gmail] Email sent successfully:", { messageId: info.messageId, to: to?.slice(0, 30) });
    return true;
  } catch (error) {
    const code = error.code || "EMAIL_ERROR";
    const message = error.message || String(error);
    console.error("[sendEmailWithAttachment:Gmail] Failed:", {
      code, message, to: to?.slice(0, 30), subject,
      stack: error.stack?.split("\n").slice(0, 3).join(" | "),
    });
    return { sent: false, code };
  }
}

module.exports = { sendEmail, sendEmailwithAttachment };
