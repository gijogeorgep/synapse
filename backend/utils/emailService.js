import 'dotenv/config';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const smtpPort = Number(process.env.EMAIL_PORT || 587);
// Use SSL only for port 465; otherwise use STARTTLS (secure=false)
const isSecure = smtpPort === 465;
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: smtpPort,
  secure: isSecure,

  auth: {
    user: process.env.EMAIL_USER,
    // Trim any stray whitespace or newline characters from the password
    pass: (process.env.EMAIL_PASS || '').trim()
  }
});
// Verify connection at startup (logs any errors)
transporter.verify(function (error, success) {
  if (error) {
    console.error('✖ SMTP connection verification failed:', error);
  } else {
    console.log('✔ SMTP connection verified');
  }
});

// Modern, Premium Email Template Layout
const emailLayout = (header, content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #eef4fb;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .wrapper {
    width: 100%;
    table-layout: fixed;
    background-color: #eef4fb;
    padding: 48px 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #d0e4f5;
  }
  .header {
    background-color: #ffffff;
    padding: 28px 40px 20px 40px;
    text-align: center;
    border-bottom: 1px solid #e8f1fb;
  }
  .logo {
    max-width: 140px;
    height: auto;
    display: block;
    margin: 0 auto;
  }
  .content {
    padding: 36px 40px;
    color: #4a6a8a;
    line-height: 1.75;
  }
  .content h2 {
    margin-top: 0;
    color: #0d2640;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
  }
  .content p {
    margin-top: 0;
    margin-bottom: 18px;
    font-size: 14px;
    color: #4a6a8a;
  }
  .highlight-card {
    background-color: #f3f8fd;
    border-radius: 10px;
    padding: 20px;
    margin: 24px 0;
    border: 1px solid #c8dff2;
    border-left: 4px solid #1a7fd4;
  }
  .meta-group {
    margin-bottom: 14px;
  }
  .meta-group:last-child {
    margin-bottom: 0;
  }
  .label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #7aaac8;
    letter-spacing: 0.07em;
    margin-bottom: 3px;
    display: block;
  }
  .value {
    font-size: 14px;
    font-weight: 600;
    color: #0d2640;
    display: block;
  }
  .btn-container {
    text-align: center;
    margin: 32px 0 8px 0;
  }
  .btn {
    display: inline-block;
    padding: 13px 30px;
    background-color: #1a7fd4;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
  }
  .footer {
    background-color: #f3f8fd;
    text-align: center;
    padding: 24px 40px;
    font-size: 12px;
    color: #7aaac8;
    border-top: 1px solid #d0e4f5;
    line-height: 1.6;
  }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="cid:synapse-logo" alt="Synapse EduHub Logo" class="logo">
      </div>
      <div class="content">
        <h2>${header}</h2>
        ${content}
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Synapse EduHub. All rights reserved.<br>
        This is an automated operational message from Synapse Hub, please do not reply to this email.
      </div>
    </div>
  </div>
</body>
</html>
`;
const commonAttachments = [
  {
    filename: 'logo.png',
    path: path.join(__dirname, '../assets/logo.png'),
    cid: 'synapse-logo'
  }
];

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// 1. Registration Email (Uses Name)
export const sendRegistrationEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: `"Synapse EduHub" <${process.env.EMAIL_NOREPLY || 'noreply@synapseeduhub.com'}>`,
      to: userEmail,
      subject: 'Welcome to Synapse EduHub - Registration Successful',
      html: emailLayout(
        'Welcome to the Portal',
        `
                <p>Hello ${escapeHtml(userName)},</p>
                <p>Your registration with Synapse EduHub was successful. We are delighted to have you join our learning community!</p>
                <p>Explore your classrooms, access premium study materials, and take the next step in your educational journey with us.</p>
                <div class="btn-container">
                    <a href="https://synapseeduhub.com/login" class="btn">Access Your Dashboard</a>
                </div>
                `
      ),
      attachments: commonAttachments
    };
    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending registration email:', error);
  }
};

// 2. OTP Verification Email (Intentionally Keeps generic "Hello," for fast/secure flows)
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Synapse EduHub" <${process.env.EMAIL_NOREPLY || 'noreply@synapseeduhub.com'}>`,
      to: email,
      subject: 'Synapse EduHub - Your Email Verification Code',
      html: emailLayout(
        'Verification Code',
        `
                <p>Hello,</p>
                <p>Thank you for choosing Synapse EduHub. Please use the following security code to complete your verification process:</p>
                <div class="otp-card">
                    <span class="label">Your Verification Code</span>
                    <span class="otp-code">${otp}</span>
                </div>
                <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                `
      ),
      attachments: commonAttachments
    };
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

// 3. Study Material Email (Uses Name - Send individually or customize loop)
export const sendStudyMaterialEmail = async (studentEmail, studentName, materialTitle, classroomName, type) => {
  try {
    if (!studentEmail) return;

    const isQuestionPaper = type === 'question_paper';
    const typeDisplay = isQuestionPaper ? 'New Question Paper' : 'New Study Material';

    const mailOptions = {
      from: `"Synapse EduHub" <${process.env.EMAIL_NOTIFICATIONS || 'notifications@synapseeduhub.com'}>`,
      to: studentEmail,
      subject: `Synapse Hub - ${typeDisplay} Available`,
      html: emailLayout(
        typeDisplay,
        `
                <p>Hello ${escapeHtml(studentName)},</p>
                <p>A new learning resource has been uploaded for your classroom. You can now access it through your student portal.</p>
                <div class="highlight-card">
                    <div class="meta-group">
                        <span class="label">Resource Title</span>
                        <span class="value">${escapeHtml(materialTitle)}</span>
                    </div>
                    <div class="meta-group" style="margin-top: 16px;">
                        <span class="label">Classroom</span>
                        <span class="value">${escapeHtml(classroomName) || 'General Access'}</span>
                    </div>
                </div>
                <p>Stay up to date with your coursework and make the most of these materials.</p>
                <div class="btn-container">
                    <a href="https://synapseeduhub.com/login" class="btn">View Materials</a>
                </div>
                `
      ),
      attachments: commonAttachments
    };
    await transporter.sendMail(mailOptions);
    console.log(`${typeDisplay} email sent to ${studentEmail}`);
  } catch (error) {
    console.error('Error sending study material email:', error);
  }
};

// 4. Exam Scheduled Email (Uses Name)
export const sendExamScheduledEmail = async (studentEmail, studentName, examTitle, date, classroomName) => {
  try {
    if (!studentEmail) return;

    const formattedDate = new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: `"Synapse EduHub" <${process.env.EMAIL_NOTIFICATIONS || 'notifications@synapseeduhub.com'}>`,
      to: studentEmail,
      subject: 'Synapse Hub - New Exam Scheduled',
      html: emailLayout(
        'New Exam Scheduled',
        `
                <p>Hello ${escapeHtml(studentName)},</p>
                <p>A new examination has been scheduled for your learning track. Please make sure to mark your calendar.</p>
                <div class="highlight-card">
                    <div class="meta-group">
                        <span class="label">Exam Title</span>
                        <span class="value">${escapeHtml(examTitle)}</span>
                    </div>
                    <div class="meta-group" style="margin-top: 16px;">
                        <span class="label">Date and Time</span>
                        <span class="value">${formattedDate}</span>
                    </div>
                    <div class="meta-group" style="margin-top: 16px;">
                        <span class="label">Classroom</span>
                        <span class="value">${escapeHtml(classroomName) || 'General Access'}</span>
                    </div>
                </div>
                <p>Prepare thoroughly and ensure you log into the portal on time for your assessment.</p>
                <div class="btn-container">
                    <a href="https://synapseeduhub.com/login" class="btn">View Exam Details</a>
                </div>
                `
      ),
      attachments: commonAttachments
    };
    await transporter.sendMail(mailOptions);
    console.log(`Exam Scheduled email sent to ${studentEmail}`);
  } catch (error) {
    console.error('Error sending exam scheduled email:', error);
  }
};

// 5. Contact Inquiry Email
export const sendContactInquiryEmail = async ({ recipientEmails, name, email, program, message }) => {
  try {
    if (!recipientEmails || recipientEmails.length === 0) {
      throw new Error('No recipient email configured for contact inquiries');
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeProgram = escapeHtml(program || 'Not specified');
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    const mailOptions = {
      from: `"Synapse EduHub" <${process.env.EMAIL_SUPPORT || 'support@synapseeduhub.com'}>`,
      to: recipientEmails,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: emailLayout(
        'New Contact Inquiry',
        `
                <p>A new message has been submitted through the Synapse EduHub contact form.</p>
                <div class="highlight-card">
                    <div class="meta-group">
                        <span class="label">Sender Name</span>
                        <span class="value">${safeName}</span>
                    </div>
                    <div class="meta-group" style="margin-top: 16px;">
                        <span class="label">Email Address</span>
                        <span class="value">${safeEmail}</span>
                    </div>
                    <div class="meta-group" style="margin-top: 16px;">
                        <span class="label">Program of Interest</span>
                        <span class="value">${safeProgram}</span>
                    </div>
                    <div class="meta-group" style="margin-top: 16px;">
                        <span class="label">Message</span>
                        <span class="value" style="font-weight: 500; line-height: 1.8; color: #475569;">${safeMessage}</span>
                    </div>
                </div>
                <p>You can reply directly to this email to respond to the user.</p>
                `
      ),
      attachments: commonAttachments
    };

    await transporter.sendMail(mailOptions);
    console.log(`Contact inquiry email sent to ${recipientEmails.join(', ')}`);
  } catch (error) {
    console.error('Error sending contact inquiry email:', error);
    throw error;
  }
};

// 6. Classroom Created Email (Uses Name)
export const sendClassroomCreatedEmail = async (teacherEmail, teacherName, classroomName) => {
  try {
    if (!teacherEmail) return;
    const mailOptions = {
      from: `"Synapse EduHub" <${process.env.EMAIL_NOREPLY || 'noreply@synapseeduhub.com'}>`,
      to: teacherEmail,
      subject: 'New Classroom Created - Action Required',
      html: emailLayout(
        'New Classroom Assigned',
        `
          <p>Hello ${escapeHtml(teacherName)},</p>
          <p>A new classroom <strong>${escapeHtml(classroomName)}</strong> has been successfully set up and assigned to you.</p>
          <p>Please review the classroom structure, verify enrolled students, and begin uploading your curriculum setup.</p>
          <div class="btn-container">
            <a href="https://synapseeduhub.com/login" class="btn">Go to Dashboard</a>
          </div>
        `
      ),
      attachments: commonAttachments,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Classroom creation email sent to teacher: ${teacherEmail}`);
  } catch (error) {
    console.error('Error sending classroom creation email:', error);
  }
};

// 7. Exam Submission Reminder Email (Uses Name)
export const sendExamSubmissionReminderEmail = async (studentEmail, studentName, examTitle, classroomName) => {
  try {
    if (!studentEmail) return;
    const mailOptions = {
      from: `"Synapse EduHub" <${process.env.EMAIL_NOREPLY || 'noreply@synapseeduhub.com'}>`,
      to: studentEmail,
      subject: 'Reminder: Upcoming Exam Submission',
      html: emailLayout(
        'Exam Submission Reminder',
        `
          <p>Hello ${escapeHtml(studentName)},</p>
          <p>This is a friendly reminder to complete and submit your exam <strong>${escapeHtml(examTitle)}</strong> for classroom <strong>${escapeHtml(classroomName)}</strong>.</p>
          <p>Please log in and ensure your submission is finalized before the scheduled deadline.</p>
          <div class="btn-container">
            <a href="https://synapseeduhub.com/login" class="btn">Go to Dashboard</a>
          </div>
        `
      ),
      attachments: commonAttachments,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Exam submission reminder sent to student: ${studentEmail}`);
  } catch (error) {
    console.error('Error sending exam submission reminder email:', error);
  }
};