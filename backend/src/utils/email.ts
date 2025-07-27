import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function sendEmail(to: string, subject: string, text: string) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM as string, // Must be a verified sender in SendGrid
    subject,
    text,
  };
  await sgMail.send(msg);
} 