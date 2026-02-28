import { Resend } from 'resend';

let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn(
    'RESEND_API_KEY not set — confirmation emails will not be sent'
  );
}

const FROM_ADDRESS = 'TNE United Express <noreply@tnebasketball.com>';

function getAdminEmails(): string[] {
  const envVal = process.env.ADMIN_NOTIFICATION_EMAILS || 'pernell@gmail.com';
  return envVal.split(',').map((e) => e.trim()).filter(Boolean);
}

function emailHeader(): string {
  return `
        <!-- Header -->
        <tr>
          <td style="background:#8B1F3A;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">TNE United Express</h1>
          </td>
        </tr>`;
}

function emailFooter(): string {
  return `
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
              TNE United Express Basketball &bull; Omaha, NE
            </p>
          </td>
        </tr>`;
}

function wrapEmail(body: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
        ${emailHeader()}
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>
        ${emailFooter()}
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 0;color:#6b7280;font-size:14px;width:140px;">${label}</td>
      <td style="padding:6px 0;color:#050505;font-size:14px;font-weight:600;">${value || '—'}</td>
    </tr>`;
}

function detailsTable(rows: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;">
      <tr>
        <td style="padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`;
}

// ─── Existing: Tryout Confirmation to Parent ─────────────────────────

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

  const body = `
    <h2 style="margin:0 0 16px;color:#050505;font-size:20px;">Registration Confirmed</h2>
    <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.5;">
      <strong>${playerName}</strong> has been successfully registered for tryouts. Here are the details:
    </p>
    ${detailsTable(
      detailRow('Date', sessionDate) +
      detailRow('Time', sessionTime) +
      detailRow('Location', location) +
      detailRow('Grades', gradeText)
    )}
    <p style="margin:24px 0 0;color:#374151;font-size:14px;line-height:1.5;">
      Please arrive 15 minutes early. Bring water, basketball shoes, and athletic clothing.
    </p>
    <p style="margin:16px 0 0;color:#374151;font-size:14px;line-height:1.5;">
      If you have any questions, reply to this email or contact us at
      <a href="mailto:info@tnebasketball.com" style="color:#E31837;">info@tnebasketball.com</a>.
    </p>`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Tryout Registration Confirmed — ${playerName}`,
    html: wrapEmail(body),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

// ─── New: Admin Tryout Notification ──────────────────────────────────

interface AdminTryoutNotificationParams {
  playerFirstName: string;
  playerLastName: string;
  playerDob: string;
  playerGrade: string;
  playerGender: string;
  playerSchool?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail: string;
  parentPhone: string;
  relationship?: string;
  sessionDate: string;
  sessionTime: string;
  location: string;
  grades: string[] | null;
}

export async function sendAdminTryoutNotification(params: AdminTryoutNotificationParams) {
  if (!resend) {
    console.warn('Skipping admin notification — Resend not configured');
    return;
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return;

  const playerName = `${params.playerFirstName} ${params.playerLastName}`;
  const parentName = [params.parentFirstName, params.parentLastName].filter(Boolean).join(' ') || '—';
  const gradeText = params.grades?.length ? params.grades.join(', ') : 'All grades';

  const body = `
    <h2 style="margin:0 0 8px;color:#050505;font-size:20px;">New Tryout Signup</h2>
    <p style="margin:0 0 24px;color:#374151;font-size:14px;">A new player has registered for tryouts.</p>

    <h3 style="margin:0 0 8px;color:#8B1F3A;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Player Info</h3>
    ${detailsTable(
      detailRow('Name', playerName) +
      detailRow('Date of Birth', params.playerDob) +
      detailRow('Grade', params.playerGrade) +
      detailRow('Gender', params.playerGender) +
      detailRow('School', params.playerSchool || '—')
    )}

    <h3 style="margin:24px 0 8px;color:#8B1F3A;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Parent/Guardian</h3>
    ${detailsTable(
      detailRow('Name', parentName) +
      detailRow('Relationship', params.relationship || '—') +
      detailRow('Email', params.parentEmail) +
      detailRow('Phone', params.parentPhone)
    )}

    <h3 style="margin:24px 0 8px;color:#8B1F3A;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Session Details</h3>
    ${detailsTable(
      detailRow('Date', params.sessionDate) +
      detailRow('Time', params.sessionTime) +
      detailRow('Location', params.location) +
      detailRow('Grades', gradeText)
    )}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: adminEmails,
    subject: `New Tryout Signup — ${playerName}`,
    html: wrapEmail(body),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

// ─── New: Registration Confirmation to Parent (team/season) ──────────

interface RegistrationConfirmationParams {
  to: string;
  playerName: string;
  registrationType: 'team' | 'season';
  teamOrSeasonName: string;
  parentName: string;
  referenceId: string;
}

export async function sendRegistrationConfirmation({
  to,
  playerName,
  registrationType,
  teamOrSeasonName,
  parentName,
  referenceId,
}: RegistrationConfirmationParams) {
  if (!resend) {
    console.warn('Skipping registration confirmation — Resend not configured');
    return;
  }

  const typeLabel = registrationType === 'season' ? 'Season' : 'Team';

  const body = `
    <h2 style="margin:0 0 16px;color:#050505;font-size:20px;">Registration Confirmed</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:16px;line-height:1.5;">
      Hi ${parentName || 'there'},
    </p>
    <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.5;">
      <strong>${playerName}</strong> has been successfully registered. Here are your details:
    </p>
    ${detailsTable(
      detailRow('Player', playerName) +
      detailRow(typeLabel, teamOrSeasonName) +
      detailRow('Reference ID', referenceId)
    )}
    <p style="margin:24px 0 0;color:#374151;font-size:14px;line-height:1.5;">
      Please save your reference ID for your records. A coach or program director will follow up with next steps.
    </p>
    <p style="margin:16px 0 0;color:#374151;font-size:14px;line-height:1.5;">
      If you have any questions, contact us at
      <a href="mailto:info@tnebasketball.com" style="color:#E31837;">info@tnebasketball.com</a>.
    </p>`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Registration Confirmed — ${playerName}`,
    html: wrapEmail(body),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

// ─── New: Admin Registration Notification (team/season) ──────────────

interface AdminRegistrationNotificationParams {
  registrationType: 'team' | 'season';
  referenceId: string;
  // Player
  playerFirstName: string;
  playerLastName: string;
  playerDob: string;
  playerAge?: string;
  playerGrade: string;
  playerGender: string;
  jerseySize?: string;
  desiredJerseyNumber?: string;
  lastTeamPlayedFor?: string;
  // Parent 1
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  parentHomePhone?: string;
  parentRelationship?: string;
  parentAddress?: string;
  // Parent 2
  parent2FirstName?: string;
  parent2LastName?: string;
  parent2Email?: string;
  parent2Phone?: string;
  parent2HomePhone?: string;
  parent2Relationship?: string;
  // Emergency
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  // Registration
  teamOrSeasonName: string;
  paymentPlan?: string;
}

export async function sendAdminRegistrationNotification(params: AdminRegistrationNotificationParams) {
  if (!resend) {
    console.warn('Skipping admin registration notification — Resend not configured');
    return;
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return;

  const playerName = `${params.playerFirstName} ${params.playerLastName}`;
  const parentName = `${params.parentFirstName} ${params.parentLastName}`;
  const typeLabel = params.registrationType === 'season' ? 'Season' : 'Team';

  let playerRows =
    detailRow('Name', playerName) +
    detailRow('Date of Birth', params.playerDob) +
    (params.playerAge ? detailRow('Age', params.playerAge) : '') +
    detailRow('Grade', params.playerGrade) +
    detailRow('Gender', params.playerGender) +
    (params.jerseySize ? detailRow('Jersey Size', params.jerseySize) : '') +
    (params.desiredJerseyNumber ? detailRow('Jersey #', params.desiredJerseyNumber) : '') +
    (params.lastTeamPlayedFor ? detailRow('Last Team', params.lastTeamPlayedFor) : '');

  let parent1Rows =
    detailRow('Name', parentName) +
    detailRow('Relationship', params.parentRelationship || '—') +
    detailRow('Email', params.parentEmail) +
    detailRow('Cell Phone', params.parentPhone) +
    (params.parentHomePhone ? detailRow('Home Phone', params.parentHomePhone) : '') +
    (params.parentAddress ? detailRow('Address', params.parentAddress) : '');

  let parent2Section = '';
  if (params.parent2FirstName || params.parent2LastName) {
    const parent2Name = [params.parent2FirstName, params.parent2LastName].filter(Boolean).join(' ');
    parent2Section = `
      <h3 style="margin:24px 0 8px;color:#8B1F3A;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Parent/Guardian 2</h3>
      ${detailsTable(
        detailRow('Name', parent2Name) +
        detailRow('Relationship', params.parent2Relationship || '—') +
        (params.parent2Email ? detailRow('Email', params.parent2Email) : '') +
        (params.parent2Phone ? detailRow('Cell Phone', params.parent2Phone) : '') +
        (params.parent2HomePhone ? detailRow('Home Phone', params.parent2HomePhone) : '')
      )}`;
  }

  let emergencySection = '';
  if (params.emergencyContactName) {
    emergencySection = `
      <h3 style="margin:24px 0 8px;color:#8B1F3A;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Emergency Contact</h3>
      ${detailsTable(
        detailRow('Name', params.emergencyContactName) +
        detailRow('Phone', params.emergencyContactPhone || '—')
      )}`;
  }

  const body = `
    <h2 style="margin:0 0 8px;color:#050505;font-size:20px;">New ${typeLabel} Registration</h2>
    <p style="margin:0 0 4px;color:#374151;font-size:14px;">Reference: <strong>${params.referenceId}</strong></p>
    <p style="margin:0 0 24px;color:#374151;font-size:14px;">${typeLabel}: <strong>${params.teamOrSeasonName}</strong></p>
    ${params.paymentPlan ? `<p style="margin:0 0 24px;color:#374151;font-size:14px;">Payment Plan: <strong>${params.paymentPlan}</strong></p>` : ''}

    <h3 style="margin:0 0 8px;color:#8B1F3A;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Player Info</h3>
    ${detailsTable(playerRows)}

    <h3 style="margin:24px 0 8px;color:#8B1F3A;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Parent/Guardian 1</h3>
    ${detailsTable(parent1Rows)}

    ${parent2Section}
    ${emergencySection}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: adminEmails,
    subject: `New ${typeLabel} Registration — ${playerName}`,
    html: wrapEmail(body),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
