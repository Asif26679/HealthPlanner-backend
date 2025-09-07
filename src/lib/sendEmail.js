import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY); // should print your key

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Website <website@resend.dev>",
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error({ error });
    } else {
      console.log(data);
    }
  } catch (err) {
    console.error(err);
  }
};
