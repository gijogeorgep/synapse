import 'dotenv/config';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.zoho.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Common styling and structure
const emailLayout = (header, content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f8fafc;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
  }
  .wrapper {
    width: 100%;
    table-layout: fixed;
    background-color: #f8fafc;
    padding-bottom: 40px;
    padding-top: 40px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }
  .header {
    background-color: #ffffff;
    padding: 32px 40px;
    text-align: center;
    border-bottom: 1px solid #f1f5f9;
  }
  .logo {
    max-width: 180px;
    height: auto;
    display: block;
    margin: 0 auto;
  }
  .content {
    padding: 40px;
    color: #1e293b;
    line-height: 1.7;
  }
  .content h2 {
    margin-top: 0;
    color: #0f172a;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.025em;
  }
  .content p {
    margin-bottom: 24px;
    font-size: 16px;
    color: #475569;
  }
  .footer {
    background-color: #f8fafc;
    text-align: center;
    padding: 32px;
    font-size: 13px;
    color: #64748b;
    border-top: 1px solid #f1f5f9;
  }
  .btn {
    display: inline-block;
    padding: 12px 28px;
    background-color: #0ea5e9;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 15px;
    margin-top: 4px;
    box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);
  }
  .highlight-card {
    background-color: #f1f5f9;
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
    border: 1px solid #e2e8f0;
  }
  .otp-code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 36px;
    font-weight: 800;
    color: #0ea5e9;
    letter-spacing: 8px;
    text-align: center;
    display: block;
    margin: 10px 0;
  }
  .label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: #94a3b8;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
    display: block;
  }
  .value {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    display: block;
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
        This is an automated message from Synapse Hub, please do not reply to this email.
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

export const sendRegistrationEmail = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: `"Synapse EduHub" <${process.env.EMAIL_NOREPLY || 'noreply@synapseeduhub.com'}>`,
            to: userEmail,
            subject: 'Welcome to Synapse EduHub - Registration Successful',
            html: emailLayout(
                'Welcome to the Portal',
                `
                <p>Hello ${userName},</p>
                <p>Your registration with Synapse EduHub was successful. We are delighted to have you join our learning community.</p>
                <p>Explore your classrooms, access premium study materials, and take the next step in your educational journey with us.</p>
                <div style="text-align: center; margin-top: 32px;">
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
                <p>Thank you for choosing Synapse EduHub. Please use the following code to complete your verification process:</p>
                <div class="highlight-card">
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

export const sendStudyMaterialEmail = async (studentEmails, materialTitle, classroomName, type) => {
    try {
        if (!studentEmails || studentEmails.length === 0) return;

        const isQuestionPaper = type === 'question_paper';
        const typeDisplay = isQuestionPaper ? 'New Question Paper' : 'New Study Material';
        
        const mailOptions = {
            from: `"Synapse EduHub" <${process.env.EMAIL_NOTIFICATIONS || 'notifications@synapseeduhub.com'}>`,
            bcc: studentEmails,
            subject: `Synapse Hub - ${typeDisplay} Available`,
            html: emailLayout(
                typeDisplay,
                `
                <p>Hello Student,</p>
                <p>A new resource has been uploaded for your classroom. You can now access it through your student portal.</p>
                <div class="highlight-card">
                    <span class="label">Title</span>
                    <span class="value">${materialTitle}</span>
                    <div style="margin-top: 16px;">
                        <span class="label">Classroom</span>
                        <span class="value">${classroomName || 'General Access'}</span>
                    </div>
                </div>
                <p>Stay up to date with your coursework and make the most of these resources.</p>
                <div style="text-align: center; margin-top: 32px;">
                    <a href="https://synapseeduhub.com/login" class="btn">View Materials</a>
                </div>
                `
            ),
            attachments: commonAttachments
        };
        await transporter.sendMail(mailOptions);
        console.log(`${typeDisplay} email sent to ${studentEmails.length} students`);
    } catch (error) {
        console.error('Error sending study material email:', error);
    }
};

export const sendExamScheduledEmail = async (studentEmails, examTitle, date, classroomName) => {
    try {
        if (!studentEmails || studentEmails.length === 0) return;

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
            bcc: studentEmails,
            subject: 'Synapse Hub - New Exam Scheduled',
            html: emailLayout(
                'New Exam Scheduled',
                `
                <p>Hello Student,</p>
                <p>A new exam has been scheduled for your learning track. Please ensure you are prepared.</p>
                <div class="highlight-card">
                    <span class="label">Exam Title</span>
                    <span class="value">${examTitle}</span>
                    <div style="margin-top: 16px;">
                        <span class="label">Date and Time</span>
                        <span class="value">${formattedDate}</span>
                    </div>
                    <div style="margin-top: 16px;">
                        <span class="label">Classroom</span>
                        <span class="value">${classroomName || 'General Access'}</span>
                    </div>
                </div>
                <p>Prepare well and log into the portal on time for your assessment.</p>
                <div style="text-align: center; margin-top: 32px;">
                    <a href="https://synapseeduhub.com/login" class="btn">View Exam Details</a>
                </div>
                `
            ),
            attachments: commonAttachments
        };
        await transporter.sendMail(mailOptions);
        console.log(`Exam Scheduled email sent to ${studentEmails.length} students`);
    } catch (error) {
        console.error('Error sending exam scheduled email:', error);
    }
};

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
                    <span class="label">Name</span>
                    <span class="value">${safeName}</span>
                    <div style="margin-top: 16px;">
                        <span class="label">Email</span>
                        <span class="value">${safeEmail}</span>
                    </div>
                    <div style="margin-top: 16px;">
                        <span class="label">Program of Interest</span>
                        <span class="value">${safeProgram}</span>
                    </div>
                    <div style="margin-top: 16px;">
                        <span class="label">Message</span>
                        <span class="value" style="font-weight: 500; line-height: 1.8;">${safeMessage}</span>
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
