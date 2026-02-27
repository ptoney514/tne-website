import { Resend } from 'resend';

let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn(
    'RESEND_API_KEY not set — confirmation emails will not be sent'
  );
}

interface TryoutConfirmationParams {
  to: string;
  playerName: string;
  sessionDate: string;
  sessionTime: string;
  location: string;
  grades: string[] | null;
}

export async function sendTryoutConfirmation({
  to,
  playerName,
  sessionDate,
  sessionTime,
  location,
  grades,
}: TryoutConfirmationParams) {
  if (!resend) {
    console.warn('Skipping confirmation email — Resend not configured');
    return;
  }

  const gradeText = grades?.length ? grades.join(', ') : 'All grades';

  const { error } = await resend.emails.send({
    from: 'TNE United Express <noreply@tnebasketball.com>',
    to,
    subject: `Tryout Registration Confirmed — ${playerName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:#8B1F3A;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">TNE United Express</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 16px;color:#050505;font-size:20px;">Registration Confirmed</h2>
            <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.5;">
              <strong>${playerName}</strong> has been successfully registered for tryouts. Here are the details:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:20px;">
              <tr>
                <td style="padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:14px;width:100px;">Date</td>
                      <td style="padding:6px 0;color:#050505;font-size:14px;font-weight:600;">${sessionDate}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:14px;">Time</td>
                      <td style="padding:6px 0;color:#050505;font-size:14px;font-weight:600;">${sessionTime}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:14px;">Location</td>
                      <td style="padding:6px 0;color:#050505;font-size:14px;font-weight:600;">${location}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:14px;">Grades</td>
                      <td style="padding:6px 0;color:#050505;font-size:14px;font-weight:600;">${gradeText}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#374151;font-size:14px;line-height:1.5;">
              Please arrive 15 minutes early. Bring water, basketball shoes, and athletic clothing.
            </p>
            <p style="margin:16px 0 0;color:#374151;font-size:14px;line-height:1.5;">
              If you have any questions, reply to this email or contact us at
              <a href="mailto:info@tnebasketball.com" style="color:#E31837;">info@tnebasketball.com</a>.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
              TNE United Express Basketball &bull; Omaha, NE
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
