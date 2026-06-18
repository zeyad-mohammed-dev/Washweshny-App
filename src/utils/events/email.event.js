import { EventEmitter } from 'node:events';
import { sendEmail } from '../email/email.service.js';
import { verifyEmailTemplate } from '../email/templates/verify-email.template.js';
import { resetPasswordTemplate } from '../email/templates/reset-password.template.js';

export const emailEmitter = new EventEmitter();

emailEmitter.on(
  'sendVerificationEmail',
  async ({ to = '', firstName = '', otp = '' }) => {
    try {
      await sendEmail({
        to,
        subject: 'Verify Your Email',
        html: verifyEmailTemplate({ firstName, otp }),
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }
);

emailEmitter.on(
  'sendPasswordResetEmail',
  async ({ to = '', firstName = '', otp = '' }) => {
    try {
      await sendEmail({
        to,
        subject: 'Reset Password',
        html: resetPasswordTemplate({ firstName, otp }),
      });
    } catch (error) {
      console.error('Error sending reset password:', error);
    }
  }
);
