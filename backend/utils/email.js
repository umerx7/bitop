const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text
  };

  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - BITOP</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0e17;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td style="text-align: center; padding: 40px 0;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #00d4ff 0%, #ffd700 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">BITOP</h1>
          </td>
        </tr>
        <tr>
          <td style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(0, 212, 255, 0.2);">
            <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 24px; font-weight: 600;">Verify Your Email Address</h2>
            <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">Hi ${user.name},</p>
            <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">Welcome to BITOP! Please verify your email address to activate your account and start trading.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #0a0e17; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Email Address</a>
            </div>
            <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 24px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">© 2024 BITOP. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Verify Your Email Address - BITOP',
    html
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - BITOP</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0e17;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td style="text-align: center; padding: 40px 0;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #00d4ff 0%, #ffd700 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">BITOP</h1>
          </td>
        </tr>
        <tr>
          <td style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(0, 212, 255, 0.2);">
            <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
            <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">Hi ${user.name},</p>
            <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">You requested a password reset. Click the button below to create a new password.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #0a0e17; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
            </div>
            <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">This link will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 24px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">© 2024 BITOP. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Reset Your Password - BITOP',
    html
  });
};

const sendWithdrawalConfirmationEmail = async (user, withdrawal) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Withdrawal Request - BITOP</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0e17;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td style="text-align: center; padding: 40px 0;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #00d4ff 0%, #ffd700 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">BITOP</h1>
          </td>
        </tr>
        <tr>
          <td style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(0, 212, 255, 0.2);">
            <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 24px; font-weight: 600;">Withdrawal Request Submitted</h2>
            <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">Hi ${user.name},</p>
            <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">Your withdrawal request has been received and is being processed.</p>
            <div style="background: rgba(0, 212, 255, 0.1); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Amount</p>
              <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${withdrawal.amount} ${withdrawal.currency}</p>
            </div>
            <div style="background: rgba(0, 212, 255, 0.1); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">To Address</p>
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-family: monospace; word-break: break-all;">${withdrawal.address}</p>
            </div>
            <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">You will receive another notification once the withdrawal is completed.</p>
            <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 24px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">© 2024 BITOP. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    email: user.email,
    subject: `Withdrawal Request - ${withdrawal.amount} ${withdrawal.currency}`,
    html
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWithdrawalConfirmationEmail
};