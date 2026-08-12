import Papa from 'papaparse';
import { Candidate } from '../models/Candidate.js';
import { isDBConnected } from '../config/db.js';
import { logger } from '../utils/logger.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and imports candidate records from CSV string or buffer.
 */
export async function parseAndImportCandidates(csvContent, createdBy = 'HR Team') {
  const parseResult = Papa.parse(csvContent.toString(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
  });

  const rows = parseResult.data || [];
  let imported = 0;
  let skipped = 0;
  let duplicates = 0;
  let invalid = 0;
  const errors = [];
  const validCandidates = [];
  const seenEmailsInBatch = new Set();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // header is row 1

    const fullName = row.fullname || row.name || row.candidatename;
    const email = (row.email || row.candidateemail || '').toLowerCase().trim();
    const jobRole = row.jobrole || row.role || row.position || 'Software Engineer';
    const department = row.department || row.dept || 'Engineering';
    const company = row.company || row.organization || 'Thodar Technologies';
    const location = row.location || row.city || 'Remote';
    const salary = row.salary || row.ctc || '$90,000 / year';
    const phone = row.phone || row.mobile || row.contact || '';
    const joiningDate = row.joiningdate || row.startdate || '';
    const status = row.status || 'Applied';

    // 1. Check required fields
    if (!fullName || !email) {
      invalid++;
      errors.push({ row: rowNum, error: 'Missing required field: Full Name or Email' });
      continue;
    }

    // 2. Validate email format
    if (!EMAIL_REGEX.test(email)) {
      invalid++;
      errors.push({ row: rowNum, error: `Invalid email format: ${email}` });
      continue;
    }

    // 3. Batch duplicate check
    if (seenEmailsInBatch.has(email)) {
      duplicates++;
      skipped++;
      errors.push({ row: rowNum, error: `Duplicate email in CSV: ${email}` });
      continue;
    }
    seenEmailsInBatch.add(email);

    // 4. DB duplicate check
    if (isDBConnected()) {
      const existing = await Candidate.findOne({ email });
      if (existing) {
        duplicates++;
        skipped++;
        errors.push({ row: rowNum, error: `Candidate already exists in database: ${email}` });
        continue;
      }
    }

    const candidateId = `TD-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    validCandidates.push({
      candidateId,
      fullName: fullName.trim(),
      email,
      phone: phone.trim(),
      jobRole: jobRole.trim(),
      department: department.trim(),
      company: company.trim(),
      location: location.trim(),
      salary: salary.trim(),
      joiningDate: joiningDate.trim(),
      status,
      createdBy,
    });
  }

  if (validCandidates.length > 0 && isDBConnected()) {
    await Candidate.insertMany(validCandidates);
    imported = validCandidates.length;
  } else if (!isDBConnected()) {
    imported = validCandidates.length;
  }

  return {
    imported,
    skipped,
    duplicates,
    invalid,
    totalRows: rows.length,
    errors,
    candidates: validCandidates,
  };
}

/**
 * Export candidates to CSV format.
 */
export function exportCandidatesToCsv(candidates = []) {
  const fields = [
    'candidateId',
    'fullName',
    'email',
    'phone',
    'jobRole',
    'department',
    'company',
    'location',
    'salary',
    'joiningDate',
    'status',
    'createdAt',
  ];

  const data = candidates.map(c => ({
    candidateId: c.candidateId || '',
    fullName: c.fullName || '',
    email: c.email || '',
    phone: c.phone || '',
    jobRole: c.jobRole || '',
    department: c.department || '',
    company: c.company || '',
    location: c.location || '',
    salary: c.salary || '',
    joiningDate: c.joiningDate || '',
    status: c.status || '',
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : '',
  }));

  return Papa.unparse({
    fields,
    data,
  });
}
