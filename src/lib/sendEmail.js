import * as brevo from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

// Declare only ONCE
const brevoClient = new brevo.TransactionalEmailsApi();
brevoClient.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export const sendMail = async (to, subject, html) => {
  try {
    const sendSmtpEmail = {
      sender: { name: "Health Planner", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    const result = await brevoClient.sendTransacEmail(sendSmtpEmail);

    console.log("✅ Email sent successfully:", data.messageId || data);

    return data;
  } catch (error) {
    console.error(
      "❌ Email sending failed:",
      error.response?.body || error.message
    );
    throw error;
  }
};
