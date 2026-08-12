import { Candidate } from '../models/Candidate.js';
import { EmailTemplate } from '../models/EmailTemplate.js';
import { DocumentTemplate } from '../models/DocumentTemplate.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { isDBConnected } from '../config/db.js';
import { logger } from '../utils/logger.js';

export async function seedInitialData() {
  if (!isDBConnected()) return;

  try {
    // 1. Seed System Settings
    const settingsCount = await SystemSettings.countDocuments();
    if (settingsCount === 0) {
      await SystemSettings.create({
        companyName: 'Thodar Technologies Inc.',
        companyEmail: 'talent@thodar.dev',
        companyAddress: '500 Howard Street, Suite 300, San Francisco, CA 94105',
        companyWebsite: 'https://thodar.dev',
        hrName: 'Sarah Jenkins (Director of Talent Acquisition)',
        hrContact: '+1 (415) 890-1234',
        defaultSmtpFrom: '"Thodar Talent" <talent@thodar.dev>',
      });
      logger.info('Default SystemSettings seeded.');
    }

    // 2. Seed Email Templates
    const emailTemplateCount = await EmailTemplate.countDocuments();
    if (emailTemplateCount === 0) {
      await EmailTemplate.insertMany([
        {
          name: 'Job Offer Letter & Welcome',
          category: 'Offer',
          subject: 'Congratulations {{candidateName}} — Formal Offer for {{jobRole}} at {{companyName}}',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: auto;">
              <h2 style="color: #4338ca; border-bottom: 2px solid #e0e7ff; padding-bottom: 10px;">Official Job Offer</h2>
              <p>Dear <strong>{{candidateName}}</strong>,</p>
              <p>We are delighted to extend a formal offer of employment for the position of <strong>{{jobRole}}</strong> with the <strong>{{department}}</strong> team at <strong>{{companyName}}</strong>!</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #4338ca; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 4px 0;"><strong>Position:</strong> {{jobRole}}</p>
                <p style="margin: 4px 0;"><strong>Location:</strong> {{location}}</p>
                <p style="margin: 4px 0;"><strong>Annual Compensation (CTC):</strong> {{salary}}</p>
                <p style="margin: 4px 0;"><strong>Anticipated Start Date:</strong> {{joiningDate}}</p>
              </div>
              <p>Please find attached your personalized <strong>Offer Letter</strong> PDF detailing your compensation structure, employee benefits, and organizational policies.</p>
              <p>Kindly sign and return a scanned copy by <strong>{{currentDate}}</strong> to confirm your acceptance.</p>
              <br/>
              <p>Warm regards,</p>
              <p><strong>{{hrName}}</strong><br/>{{companyName}}<br/>{{companyEmail}}</p>
            </div>
          `,
          variables: ['candidateName', 'jobRole', 'department', 'companyName', 'location', 'salary', 'joiningDate', 'currentDate', 'hrName', 'companyEmail'],
        },
        {
          name: 'Executive Leadership Appointment Letter',
          category: 'Offer',
          subject: 'Executive Appointment: {{jobRole}} — {{candidateName}}',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: auto;">
              <h2 style="color: #6366f1; border-bottom: 2px solid #e0e7ff; padding-bottom: 10px;">Executive Appointment</h2>
              <p>Dear <strong>{{candidateName}}</strong>,</p>
              <p>The Board of Directors and executive leadership team at <strong>{{companyName}}</strong> are thrilled to formally appoint you as <strong>{{jobRole}}</strong> heading the <strong>{{department}}</strong> division.</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 4px 0;"><strong>Role &amp; Title:</strong> {{jobRole}}</p>
                <p style="margin: 4px 0;"><strong>Executive Base Compensation:</strong> {{salary}}</p>
                <p style="margin: 4px 0;"><strong>Effective Joining Date:</strong> {{joiningDate}}</p>
                <p style="margin: 4px 0;"><strong>Location:</strong> {{location}}</p>
              </div>
              <p>Please review the attached formal <strong>Executive Employment Agreement</strong> with comprehensive equity clauses.</p>
              <br/>
              <p>Sincerely,</p>
              <p><strong>{{hrName}}</strong><br/>{{companyName}}</p>
            </div>
          `,
          variables: ['candidateName', 'jobRole', 'department', 'companyName', 'location', 'salary', 'joiningDate', 'hrName'],
        },
        {
          name: 'Interview Invitation — Technical Round',
          category: 'Interview',
          subject: 'Interview Invitation: {{jobRole}} at {{companyName}} — {{candidateName}}',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: auto;">
              <h2 style="color: #0284c7; border-bottom: 2px solid #e0f2fe; padding-bottom: 10px;">Technical Interview Invitation</h2>
              <p>Dear <strong>{{candidateName}}</strong>,</p>
              <p>Thank you for applying for the <strong>{{jobRole}}</strong> position at <strong>{{companyName}}</strong>. Our engineering leadership team was impressed by your profile.</p>
              <p>We would love to invite you for a 45-minute technical discussion regarding your background, architecture patterns, and our upcoming roadmap.</p>
              <p>Please reply with your available time slots over the next three business days.</p>
              <br/>
              <p>Best regards,</p>
              <p><strong>{{hrName}}</strong><br/>{{companyName}}</p>
            </div>
          `,
          variables: ['candidateName', 'jobRole', 'companyName', 'hrName'],
        },
        {
          name: 'Internship Offer & Stipend Details',
          category: 'Internship',
          subject: 'Internship Offer: {{jobRole}} Intern at {{companyName}} — {{candidateName}}',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: auto;">
              <h2 style="color: #059669; border-bottom: 2px solid #d1fae5; padding-bottom: 10px;">Internship Offer</h2>
              <p>Dear <strong>{{candidateName}}</strong>,</p>
              <p>We are delighted to offer you an internship as a <strong>{{jobRole}} Intern</strong> with our <strong>{{department}}</strong> team at <strong>{{companyName}}</strong>!</p>
              <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 4px 0;"><strong>Monthly Stipend:</strong> {{salary}}</p>
                <p style="margin: 4px 0;"><strong>Start Date:</strong> {{joiningDate}}</p>
                <p style="margin: 4px 0;"><strong>Workplace:</strong> {{location}}</p>
              </div>
              <p>Attached is your official <strong>Internship Appointment Letter</strong>.</p>
              <br/>
              <p>Warm regards,</p>
              <p><strong>{{hrName}}</strong><br/>{{companyName}}</p>
            </div>
          `,
          variables: ['candidateName', 'jobRole', 'department', 'companyName', 'location', 'salary', 'joiningDate', 'hrName'],
        },
        {
          name: 'Day-1 Onboarding & Welcome Guide',
          category: 'Onboarding',
          subject: 'Welcome to {{companyName}}, {{candidateName}}! Day 1 Onboarding Details',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: auto;">
              <h2 style="color: #ea580c; border-bottom: 2px solid #ffedd5; padding-bottom: 10px;">Welcome to the Team!</h2>
              <p>Hi <strong>{{candidateName}}</strong>,</p>
              <p>We are so excited to have you join <strong>{{companyName}}</strong> on <strong>{{joiningDate}}</strong> as our new <strong>{{jobRole}}</strong>!</p>
              <p>Here is what to expect on your first day:</p>
              <ul>
                <li><strong>9:30 AM:</strong> Virtual orientation & IT hardware setup</li>
                <li><strong>11:00 AM:</strong> Welcome call with the {{department}} team</li>
                <li><strong>2:00 PM:</strong> 1-on-1 with your mentor and hiring lead</li>
              </ul>
              <br/>
              <p>Cheers,</p>
              <p><strong>{{hrName}}</strong><br/>{{companyName}}</p>
            </div>
          `,
          variables: ['candidateName', 'jobRole', 'department', 'companyName', 'joiningDate', 'hrName'],
        },
        {
          name: 'Respectful Candidate Rejection / Talent Pool',
          category: 'Rejection',
          subject: 'Application Update: {{jobRole}} at {{companyName}}',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: auto;">
              <p>Dear <strong>{{candidateName}}</strong>,</p>
              <p>Thank you for taking the time to speak with our team regarding the <strong>{{jobRole}}</strong> position at <strong>{{companyName}}</strong>.</p>
              <p>While your qualifications are impressive, we have decided to proceed with another candidate whose experience aligns more closely with our immediate requirements.</p>
              <p>We will keep your resume in our active talent pool for future openings that match your skills.</p>
              <br/>
              <p>Best wishes,</p>
              <p><strong>{{hrName}}</strong><br/>{{companyName}}</p>
            </div>
          `,
          variables: ['candidateName', 'jobRole', 'companyName', 'hrName'],
        }
      ]);
      logger.info('Default Email Templates seeded.');
    }

    // 3. Seed Document Templates
    const docTemplateCount = await DocumentTemplate.countDocuments();
    if (docTemplateCount === 0) {
      await DocumentTemplate.insertMany([
        {
          name: 'Executive Offer Letter Agreement',
          type: 'offer_letter',
          description: 'Official corporate offer letter with compensation breakdown, duties, and signatures.',
          orientation: 'portrait',
          htmlTemplate: `
            <div class="header">
              <div>
                <div class="logo-text">{{companyName}} <span class="logo-badge">OFFICIAL</span></div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">{{companyAddress}}</div>
              </div>
              <div class="meta-info">
                <div><strong>Ref:</strong> {{candidateId}}</div>
                <div><strong>Date:</strong> {{currentDate}}</div>
              </div>
            </div>

            <div class="doc-title">LETTER OF EMPLOYMENT OFFER</div>

            <div class="content">
              <p style="margin-bottom: 15px;">To: <strong>{{candidateName}}</strong><br/>Email: {{candidateEmail}}<br/>Phone: {{candidatePhone}}</p>

              <p style="margin-bottom: 15px;">Dear <strong>{{candidateName}}</strong>,</p>

              <p style="margin-bottom: 15px;">
                On behalf of <strong>{{companyName}}</strong>, we are pleased to extend this formal offer of full-time employment for the position of <strong>{{jobRole}}</strong> in the <strong>{{department}}</strong> department.
              </p>

              <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left; width: 35%;">Terms</th>
                  <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Details</th>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #d1d5db;"><strong>Job Role</strong></td>
                  <td style="padding: 10px; border: 1px solid #d1d5db;">{{jobRole}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #d1d5db;"><strong>Work Location</strong></td>
                  <td style="padding: 10px; border: 1px solid #d1d5db;">{{location}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #d1d5db;"><strong>Annual Compensation (CTC)</strong></td>
                  <td style="padding: 10px; border: 1px solid #d1d5db;"><strong>{{salary}}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #d1d5db;"><strong>Date of Joining</strong></td>
                  <td style="padding: 10px; border: 1px solid #d1d5db;">{{joiningDate}}</td>
                </tr>
              </table>

              <p style="margin-bottom: 15px;">
                This offer is contingent upon successful completion of background checks and verification of academic credentials. You will report directly to the Head of Engineering.
              </p>
            </div>

            <div class="signatures">
              <div class="sig-box">
                <p><strong>{{hrName}}</strong></p>
                <p style="color: #6b7280;">Authorised Signatory</p>
                <p style="color: #6b7280;">{{companyName}}</p>
              </div>
              <div class="sig-box" style="text-align: right;">
                <p><strong>{{candidateName}}</strong></p>
                <p style="color: #6b7280;">Candidate Acceptance</p>
                <p style="color: #6b7280;">Date: ________________</p>
              </div>
            </div>

            <div class="footer">
              <span>Thodar Secure Document ID: {{candidateId}}</span>
              <span>Generated on {{currentDate}}</span>
            </div>
          `,
          variables: ['candidateName', 'candidateEmail', 'candidatePhone', 'candidateId', 'companyName', 'companyAddress', 'jobRole', 'department', 'location', 'salary', 'joiningDate', 'currentDate', 'hrName'],
        },
        {
          name: 'Proprietary Information & NDA Contract',
          type: 'nda',
          description: 'Legal non-disclosure agreement protecting confidential company information and IP.',
          orientation: 'portrait',
          htmlTemplate: `
            <div class="header">
              <div>
                <div class="logo-text">{{companyName}} LEGAL</div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">{{companyAddress}}</div>
              </div>
              <div class="meta-info">
                <div><strong>Doc ID:</strong> NDA-{{candidateId}}</div>
                <div><strong>Effective:</strong> {{currentDate}}</div>
              </div>
            </div>

            <div class="doc-title">NON-DISCLOSURE &amp; CONFIDENTIALITY AGREEMENT</div>

            <div class="content">
              <p>This Non-Disclosure Agreement is entered into between <strong>{{companyName}}</strong> and <strong>{{candidateName}}</strong> (Recipient).</p>
              
              <p style="margin: 15px 0;"><strong>1. Confidential Information:</strong> Recipient agrees to protect all proprietary code, systems, trade secrets, candidate records, and technical architectures belonging to {{companyName}}.</p>

              <p style="margin: 15px 0;"><strong>2. Term &amp; Survival:</strong> Obligations under this Agreement continue indefinitely for trade secrets and for five (5) years following termination of employment.</p>

              <p style="margin: 15px 0;"><strong>3. Governing Law:</strong> This agreement is governed by the laws of the State of California.</p>
            </div>

            <div class="signatures" style="margin-top: 40px;">
              <div class="sig-box">
                <p><strong>{{companyName}}</strong></p>
                <p style="color: #6b7280;">By: {{hrName}}</p>
              </div>
              <div class="sig-box" style="text-align: right;">
                <p><strong>{{candidateName}}</strong></p>
                <p style="color: #6b7280;">Signature: ________________</p>
              </div>
            </div>
          `,
          variables: ['candidateName', 'candidateId', 'companyName', 'companyAddress', 'hrName', 'currentDate'],
        },
        {
          name: 'Certificate of Internship Excellence',
          type: 'internship_certificate',
          description: 'Landscape verification certificate for completing internship programs.',
          orientation: 'landscape',
          htmlTemplate: `
            <div style="border: 6px double #312e81; padding: 40px; text-align: center; border-radius: 8px;">
              <div style="font-size: 26px; font-weight: 800; color: #312e81; letter-spacing: 2px;">{{companyName}}</div>
              <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">{{companyAddress}}</div>
              
              <div style="margin: 30px 0; font-size: 32px; font-weight: 700; color: #1e1b4b; text-transform: uppercase;">
                CERTIFICATE OF INTERNSHIP
              </div>

              <p style="font-size: 15px; color: #4b5563; margin-bottom: 10px;">This certificate is proudly awarded to</p>
              <div style="font-size: 28px; font-weight: 700; color: #4338ca; border-bottom: 2px solid #818cf8; display: inline-block; padding: 0 40px 6px 40px; margin-bottom: 20px;">
                {{candidateName}}
              </div>

              <p style="font-size: 14px; color: #374151; max-width: 700px; margin: 0 auto 30px auto; line-height: 1.8;">
                for exemplary performance and dedication as a <strong>{{jobRole}}</strong> intern with the <strong>{{department}}</strong> department from <strong>{{applicationDate}}</strong> to <strong>{{currentDate}}</strong>.
              </p>

              <div style="display: flex; justify-content: space-around; margin-top: 50px;">
                <div style="border-top: 1px solid #111827; width: 220px; padding-top: 8px; font-size: 13px;">
                  <strong>{{hrName}}</strong><br/><span style="color: #6b7280;">Director of Human Resources</span>
                </div>
                <div style="border-top: 1px solid #111827; width: 220px; padding-top: 8px; font-size: 13px;">
                  <strong>Verified Official Seal</strong><br/><span style="color: #6b7280;">Thodar Credentials #{{candidateId}}</span>
                </div>
              </div>
            </div>
          `,
          variables: ['candidateName', 'candidateId', 'companyName', 'companyAddress', 'jobRole', 'department', 'applicationDate', 'currentDate', 'hrName'],
        }
      ]);
      logger.info('Default Document Templates seeded.');
    }
  } catch (err) {
    logger.warn(`Initial seed warning: ${err.message}`);
  }
}
