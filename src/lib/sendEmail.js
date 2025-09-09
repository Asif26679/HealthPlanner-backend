// src/lib/sendEmail.js
import * as brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

const client = new brevo.TransactionalEmailsApi();
client.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const sendSmtpEmail = {
      sender: { name: "Health Planner", email: "your_verified_email@brevo.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    const data = await client.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent:", data.messageId);
    return data;
  } catch (error) {
    console.error("❌ Email error:", error.response?.body || error.message);
    throw error;
  }
};
