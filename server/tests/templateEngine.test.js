import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractVariables, interpolateTemplate, sanitizeEmailHtml, buildTemplateContext } from '../src/services/templateEngine.js';
import { parseAndImportCandidates, exportCandidatesToCsv } from '../src/services/candidateService.js';

describe('Template Engine Unit Tests', () => {
  it('should extract variables from text correctly', () => {
    const text = 'Hello {{candidateName}}, your role is {{jobRole}} at {{companyName}}.';
    const vars = extractVariables(text);
    assert.deepEqual(vars.sort(), ['candidateName', 'companyName', 'jobRole'].sort());
  });

  it('should interpolate dynamic variables into template', () => {
    const template = 'Dear {{candidateName}}, your CTC is {{salary}} starting on {{joiningDate}}.';
    const context = {
      candidateName: 'Inba Kumar',
      salary: '$120,000',
      joiningDate: 'September 1, 2026',
    };
    const result = interpolateTemplate(template, context);
    assert.equal(result, 'Dear Inba Kumar, your CTC is $120,000 starting on September 1, 2026.');
  });

  it('should sanitize unsafe script tags from HTML email content', () => {
    const dirty = '<p>Offer Letter</p><script>alert("xss")</script><a href="https://hireflow.dev">Sign</a>';
    const clean = sanitizeEmailHtml(dirty);
    assert.ok(!clean.includes('<script>'));
    assert.ok(clean.includes('<p>Offer Letter</p>'));
    assert.ok(clean.includes('href="https://hireflow.dev"'));
  });

  it('should build rich candidate context dictionary', () => {
    const candidate = {
      fullName: 'Sophia Chen',
      email: 'sophia@example.com',
      jobRole: 'Senior Engineer',
      salary: '$150,000',
      joiningDate: 'October 1',
    };
    const settings = {
      companyName: 'HireFlow Tech',
      hrName: 'Sarah Jenkins',
    };
    const context = buildTemplateContext(candidate, settings);
    assert.equal(context.candidateName, 'Sophia Chen');
    assert.equal(context.companyName, 'HireFlow Tech');
    assert.equal(context.hrName, 'Sarah Jenkins');
    assert.equal(context.salary, '$150,000');
  });
});

describe('Candidate CSV Import & Validation Tests', () => {
  it('should validate CSV rows, detect duplicates, and reject malformed emails', async () => {
    const csvContent = `Full Name,Email,Job Role,Department,Salary
Alex Vance,alex.vance@example.com,Principal Architect,Platform,$180,000
Elena Rostova,elena.rostova@example.com,Security Engineer,Security,$150,000
Alex Duplicate,alex.vance@example.com,Duplicate Role,Platform,$180,000
Invalid Email,invalid-email-address,DevOps,Infra,$110,000
Missing Name,,Frontend,UI,$90,000`;

    const result = await parseAndImportCandidates(csvContent, 'Test Suite');
    assert.equal(result.imported, 2);
    assert.equal(result.duplicates, 1);
    assert.equal(result.invalid, 2);
    assert.equal(result.totalRows, 5);
  });

  it('should export candidates into properly formatted CSV string', () => {
    const candidates = [
      {
        candidateId: 'HF-1001',
        fullName: 'Marcus Vance',
        email: 'marcus@example.com',
        jobRole: 'UX Designer',
        department: 'Design',
        company: 'HireFlow',
        location: 'NY',
        salary: '$120,000',
        status: 'Selected',
      }
    ];

    const csvOutput = exportCandidatesToCsv(candidates);
    assert.ok(csvOutput.includes('candidateId'));
    assert.ok(csvOutput.includes('Marcus Vance'));
    assert.ok(csvOutput.includes('marcus@example.com'));
  });
});
