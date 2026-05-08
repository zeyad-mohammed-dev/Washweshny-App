import { EventEmitter } from 'node:events';
import { sendEmail } from '../email/email.service.js';
import { verifyEmailTemplate } from '../email/templates/verify-email.template.js';

export const emailEmitter = new EventEmitter();
emailEmitter.on(
  'sendVerificationEmail',
  async ({ to = '', firstName = '', otp = '' }) => {
    await sendEmail({
      to,
      subject: 'Verify Your Email',
      html: verifyEmailTemplate({ firstName, otp }),
    }).catch((error) => {
      console.log('Error sending Email', error);
      throw error;
    });
  }
);
