import { sendMail } from "./src/lib/sendMail.js";

const email = "user@example.com"; // the recipient
const otp = Math.floor(100000 + Math.random() * 900000);

sendMail(
  email,
  "Your OTP Code",
  `<p>Hello,</p><p>Your OTP is <strong>${otp}</strong></p>`
)
  .then(() => console.log("OTP sent successfully"))
  .catch(err => console.error(err));
