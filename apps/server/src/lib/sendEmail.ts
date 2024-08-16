export type TsendEmailArg = { to: string; subject: string; html: string };

import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }: TsendEmailArg) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error occurred:", error);
        throw new Error("could not send email, plz try again!");
      }
      console.log("Email sent:", info.response);
      return "sent";
    });
  } catch (err) {
    console.log(err);
    throw new Error("could not send email, plz try again!");
  }
};
