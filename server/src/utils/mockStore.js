// In-memory persistent mock store for zero-config immediate development
export const mockStore = {
  candidates: [
    {
      _id: 'cand_1001',
      candidateId: 'TD-1001',
      fullName: 'Inbavarunan',
      email: 'inbafreakz@gmail.com',
      phone: '+1 (555) 349-8812',
      jobRole: 'Lead Full Stack Architect',
      department: 'Core Platform',
      company: 'Thodar Technologies Inc.',
      location: 'San Francisco, CA (Hybrid)',
      salary: '$165,000 / year',
      joiningDate: 'September 1, 2026',
      status: 'Selected',
      notes: 'Top tier architect with deep expertise in distributed systems.',
      createdAt: new Date('2026-08-01'),
    },
    {
      _id: 'cand_1002',
      candidateId: 'TD-1002',
      fullName: 'Sophia Chen',
      email: 'sophia.chen@example.com',
      phone: '+1 (555) 782-9014',
      jobRole: 'Senior Backend Engineer',
      department: 'Infrastructure',
      company: 'Thodar Technologies Inc.',
      location: 'Seattle, WA (Remote)',
      salary: '$145,000 / year',
      joiningDate: 'October 15, 2026',
      status: 'Shortlisted',
      notes: 'Strong in Redis queues and high concurrency distributed workers.',
      createdAt: new Date('2026-08-02'),
    },
    {
      _id: 'cand_1003',
      candidateId: 'TD-1003',
      fullName: 'Marcus Vance',
      email: 'marcus.vance@example.com',
      phone: '+1 (555) 902-3341',
      jobRole: 'Product UX Designer',
      department: 'Design Systems',
      company: 'Thodar Technologies Inc.',
      location: 'New York, NY',
      salary: '$120,000 / year',
      joiningDate: 'September 15, 2026',
      status: 'Interview',
      notes: 'Portfolio includes high-fidelity dark glassmorphic SaaS tools.',
      createdAt: new Date('2026-08-03'),
    },
    {
      _id: 'cand_1004',
      candidateId: 'TD-1004',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1 (555) 601-4490',
      jobRole: 'DevOps Security Specialist',
      department: 'Security & Compliance',
      company: 'Thodar Technologies Inc.',
      location: 'Austin, TX (Remote)',
      salary: '$150,000 / year',
      joiningDate: 'August 25, 2026',
      status: 'Applied',
      notes: 'OWASP Top 10 auditor with SOC2 automation background.',
      createdAt: new Date('2026-08-04'),
    },
    {
      _id: 'cand_1005',
      candidateId: 'TD-1005',
      fullName: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      phone: '+1 (555) 219-8732',
      jobRole: 'Frontend Engineering Intern',
      department: 'Product Growth',
      company: 'Thodar Technologies Inc.',
      location: 'Remote',
      salary: '$60,000 / year',
      joiningDate: 'June 1, 2026',
      status: 'Selected',
      notes: 'Winner of 2026 University Web Engineering Hackathon.',
      createdAt: new Date('2026-08-05'),
    }
  ],

  emailTemplates: [
    {
      _id: 'tpl_1',
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
          <p>Please find attached your personalized <strong>Offer Letter</strong> PDF detailing your compensation structure and benefits.</p>
          <br/>
          <p>Warm regards,</p>
          <p><strong>{{hrName}}</strong><br/>{{companyName}}<br/>{{companyEmail}}</p>
        </div>
      `,
      variables: ['candidateName', 'jobRole', 'department', 'companyName', 'location', 'salary', 'joiningDate', 'hrName', 'companyEmail'],
      createdAt: new Date('2026-08-01'),
    },
    {
      _id: 'tpl_2',
      name: 'Interview Invitation — Technical Round',
      category: 'Interview',
      subject: 'Interview Invitation: {{jobRole}} at {{companyName}} — {{candidateName}}',
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: auto;">
          <h2 style="color: #0284c7; border-bottom: 2px solid #e0f2fe; padding-bottom: 10px;">Interview Schedule</h2>
          <p>Dear <strong>{{candidateName}}</strong>,</p>
          <p>Thank you for applying for the <strong>{{jobRole}}</strong> position at <strong>{{companyName}}</strong>. We would love to invite you for a 45-minute technical discussion.</p>
          <p>Please reply with your available time slots over the next three business days.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>{{hrName}}</strong><br/>{{companyName}}</p>
        </div>
      `,
      variables: ['candidateName', 'jobRole', 'companyName', 'hrName'],
      createdAt: new Date('2026-08-02'),
    }
  ],

  documentTemplates: [
    {
      _id: 'doc_tpl_1',
      name: 'Executive Offer Letter Agreement',
      type: 'offer_letter',
      description: 'Official corporate offer letter with compensation breakdown and signatures.',
      orientation: 'portrait',
      htmlTemplate: `
        <div class="header">
          <div>
            <div class="logo-text">{{companyName}}</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">{{companyAddress}}</div>
          </div>
          <div class="meta-info">
            <div><strong>Ref:</strong> {{candidateId}}</div>
            <div><strong>Date:</strong> {{currentDate}}</div>
          </div>
        </div>

        <div class="doc-title">LETTER OF EMPLOYMENT OFFER</div>

        <div class="content">
          <p style="margin-bottom: 15px;">To: <strong>{{candidateName}}</strong><br/>Email: {{candidateEmail}}</p>
          <p style="margin-bottom: 15px;">Dear <strong>{{candidateName}}</strong>,</p>
          <p style="margin-bottom: 15px;">
            On behalf of <strong>{{companyName}}</strong>, we are pleased to extend this formal offer of employment for the position of <strong>{{jobRole}}</strong> in the <strong>{{department}}</strong> department.
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
              <td style="padding: 10px; border: 1px solid #d1d5db;"><strong>Compensation</strong></td>
              <td style="padding: 10px; border: 1px solid #d1d5db;"><strong>{{salary}}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #d1d5db;"><strong>Date of Joining</strong></td>
              <td style="padding: 10px; border: 1px solid #d1d5db;">{{joiningDate}}</td>
            </tr>
          </table>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <p><strong>{{hrName}}</strong></p>
            <p style="color: #6b7280;">Authorised Signatory</p>
          </div>
          <div class="sig-box" style="text-align: right;">
            <p><strong>{{candidateName}}</strong></p>
            <p style="color: #6b7280;">Candidate Signature</p>
          </div>
        </div>
      `,
      cssStyles: '',
      variables: ['candidateName', 'candidateEmail', 'candidateId', 'companyName', 'companyAddress', 'jobRole', 'department', 'salary', 'joiningDate', 'currentDate', 'hrName'],
      createdAt: new Date('2026-08-01'),
    }
  ],

  campaigns: [],
  emailLogs: [],
  documents: [],
  auditLogs: []
};
