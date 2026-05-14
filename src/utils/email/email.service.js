import nodemailer from 'nodemailer';
export const sendEmail = async ({ to = '', subject = '', html = '' } = {}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // because .env return only strings so we make a condition if process.env.SMTP_SECURE equal to "true" string value will be true boolean otherwise value will be false
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};
