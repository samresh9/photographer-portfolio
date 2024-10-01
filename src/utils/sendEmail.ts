import { User } from "@prisma/client";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (
  to: string,
  user: Partial<User>,
  resetLink: string,
) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL_ADDRESS,
    to,
    subject: "Reset Password",
    html: `
  <div> 
      <p>
       Dear ${user.firstname} ${user.lastname},
      </p>
      <p>Click this link to reset your password:</p>
  <a href="${resetLink}">${resetLink}</a>
  </div>
   `,
  };

  await transporter.sendMail(mailOptions);
};
