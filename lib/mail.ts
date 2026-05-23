import nodemailer from 'nodemailer';

const port = Number(process.env.SMTP_PORT ?? 587);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465, // true for SSL (465), false for STARTTLS (587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: { rejectUnauthorized: false }
});

export async function sendSetupEmail(to: string, setupUrl: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Set your RXpress password',
      text: `Welcome to RXpress!\n\nYour subscription is active. Click the link below to set your password:\n\n${setupUrl}\n\nThis link expires in 24 hours.`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#151b27;border:1px solid #1e2a3a;border-radius:16px;padding:40px 32px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#22d3ee;">RXpress</p>
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#f1f5f9;">Welcome — your account is ready</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#94a3b8;">
            Your subscription is active. Set a password to access your dashboard.
          </p>
          <a href="${setupUrl}"
             style="display:inline-block;padding:12px 28px;background:#22d3ee;color:#0f172a;font-weight:700;font-size:14px;border-radius:9999px;text-decoration:none;">
            Set my password →
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#475569;">
            This link expires in <strong style="color:#94a3b8;">24 hours</strong>.<br/>
            If you did not subscribe to RXpress, you can safely ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
    });

    console.log(`[mail] Sent to ${to} — messageId: ${info.messageId}`);
  } catch (err) {
    // SMTP failed (local server can't reach external addresses)
    // Log the setup URL directly so the flow can be tested without email delivery
    console.error('[mail] SMTP delivery failed:', (err as Error).message);
    console.log('─'.repeat(60));
    console.log('[mail] SETUP LINK (use this to complete account setup):');
    console.log(setupUrl);
    console.log('─'.repeat(60));
  }
}
