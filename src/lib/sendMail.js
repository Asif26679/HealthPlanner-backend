import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"Health Planner" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email sending failed");
  }
};
