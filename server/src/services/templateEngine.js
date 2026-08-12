import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
  'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img'
];

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'name', 'target', 'style', 'class'],
  img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'style', 'class'],
  div: ['style', 'class'],
  span: ['style', 'class'],
  p: ['style', 'class'],
  table: ['style', 'class', 'border', 'cellpadding', 'cellspacing', 'width'],
  tr: ['style', 'class'],
  td: ['style', 'class', 'colspan', 'rowspan', 'width', 'align'],
  th: ['style', 'class', 'colspan', 'rowspan', 'width', 'align'],
  h1: ['style', 'class'],
  h2: ['style', 'class'],
  h3: ['style', 'class'],
  h4: ['style', 'class'],
};

/**
 * Extracts all `{{variableName}}` tags from a string.
 * @param {string} text
 * @returns {string[]}
 */
export function extractVariables(text = '') {
  if (!text) return [];
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const matches = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.add(match[1]);
  }
  return Array.from(matches);
}

/**
 * Replaces dynamic variables in a template safely.
 * @param {string} templateStr
 * @param {Record<string, any>} context
 * @returns {string}
 */
export function interpolateTemplate(templateStr = '', context = {}) {
  if (!templateStr) return '';

  return templateStr.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    if (context[key] !== undefined && context[key] !== null) {
      return String(context[key]);
    }
    // Fallback: return empty or match
    return '';
  });
}

/**
 * Sanitizes HTML content for email and document delivery.
 * @param {string} dirtyHtml
 * @returns {string}
 */
export function sanitizeEmailHtml(dirtyHtml = '') {
  if (!dirtyHtml) return '';
  return sanitizeHtml(dirtyHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedStyles: {
      '*': {
        // Allow common styling attributes
        'color': [/.*/],
        'background-color': [/.*/],
        'background': [/.*/],
        'text-align': [/.*/],
        'font-size': [/.*/],
        'font-family': [/.*/],
        'font-weight': [/.*/],
        'line-height': [/.*/],
        'padding': [/.*/],
        'padding-top': [/.*/],
        'padding-bottom': [/.*/],
        'padding-left': [/.*/],
        'padding-right': [/.*/],
        'margin': [/.*/],
        'margin-top': [/.*/],
        'margin-bottom': [/.*/],
        'margin-left': [/.*/],
        'margin-right': [/.*/],
        'border': [/.*/],
        'border-radius': [/.*/],
        'width': [/.*/],
        'max-width': [/.*/],
        'height': [/.*/],
      }
    }
  });
}

/**
 * Prepares context dictionary from Candidate, SystemSettings, and optional campaign info.
 */
export function buildTemplateContext(candidate = {}, settings = {}) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    candidateId: candidate.candidateId || '',
    candidateName: candidate.fullName || 'Valued Candidate',
    candidateEmail: candidate.email || '',
    candidatePhone: candidate.phone || '',
    jobRole: candidate.jobRole || 'Candidate Position',
    department: candidate.department || 'General',
    location: candidate.location || 'Remote',
    salary: candidate.salary || 'Competitive',
    joiningDate: candidate.joiningDate || 'Immediate',
    applicationDate: candidate.applicationDate
      ? new Date(candidate.applicationDate).toLocaleDateString()
      : currentDate,
    currentDate,
    companyName: settings.companyName || candidate.company || 'Thodar Technologies Inc.',
    companyEmail: settings.companyEmail || 'recruitment@thodar.dev',
    companyAddress: settings.companyAddress || '100 Silicon Valley Way, San Francisco, CA',
    companyWebsite: settings.companyWebsite || 'https://thodar.dev',
    hrName: settings.hrName || 'Talent Acquisition Team',
    hrContact: settings.hrContact || '+1 (555) 019-2834',
    ...(candidate.metadata ? Object.fromEntries(candidate.metadata) : {}),
  };
}
