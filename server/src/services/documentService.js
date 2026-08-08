import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { Document } from '../models/Document.js';
import { interpolateTemplate, sanitizeEmailHtml } from './templateEngine.js';
import { logger } from '../utils/logger.js';
import { isDBConnected } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.join(__dirname, '../../generated-docs');

let browserInstance = null;

async function getBrowser() {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }
  try {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    return browserInstance;
  } catch (err) {
    logger.error(`Puppeteer launch error: ${err.message}`);
    throw err;
  }
}

/**
 * Generates a PDF buffer and saves file to storage directory.
 */
export async function generateDocumentPdf({
  candidate,
  documentTemplate,
  context,
  campaignId = null,
}) {
  await fs.mkdir(DOCS_DIR, { recursive: true });

  const rawHtml = documentTemplate.htmlTemplate || '';
  const renderedHtml = interpolateTemplate(rawHtml, context);
  const customCss = documentTemplate.cssStyles || '';

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${documentTemplate.name} - ${candidate.fullName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        body {
          color: #111827;
          background: #ffffff;
          padding: 40px 50px;
          line-height: 1.6;
          font-size: 14px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: #1e1b4b;
          letter-spacing: -0.5px;
        }
        .logo-badge {
          background: #4f46e5;
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          margin-left: 6px;
        }
        .meta-info {
          text-align: right;
          font-size: 12px;
          color: #6b7280;
        }
        .doc-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
        }
        .content {
          margin-bottom: 40px;
        }
        .footer {
          margin-top: 50px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          font-size: 11px;
          color: #9ca3af;
          display: flex;
          justify-content: space-between;
        }
        .signatures {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .sig-box {
          border-top: 1px solid #374151;
          width: 200px;
          padding-top: 8px;
          font-size: 12px;
        }
        ${customCss}
      </style>
    </head>
    <body>
      ${renderedHtml}
    </body>
    </html>
  `;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    const isLandscape = documentTemplate.orientation === 'landscape';

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: isLandscape,
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    });

    const safeName = `${candidate.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_${documentTemplate.type}_${Date.now()}.pdf`;
    const filePath = path.join(DOCS_DIR, safeName);
    await fs.writeFile(filePath, pdfBuffer);

    let docRecord = null;
    if (isDBConnected()) {
      docRecord = await Document.create({
        candidateId: candidate._id,
        candidateName: candidate.fullName,
        documentTemplateId: documentTemplate._id,
        templateName: documentTemplate.name,
        campaignId,
        fileName: safeName,
        fileType: 'application/pdf',
        fileSize: pdfBuffer.length,
        storagePath: filePath,
        generatedAt: new Date(),
      });
    } else {
      docRecord = {
        _id: `doc_${Date.now()}`,
        candidateId: candidate._id || candidate.candidateId,
        candidateName: candidate.fullName,
        documentTemplateId: documentTemplate._id || 'dt_1',
        templateName: documentTemplate.name,
        campaignId,
        fileName: safeName,
        fileType: 'application/pdf',
        fileSize: pdfBuffer.length,
        storagePath: filePath,
        generatedAt: new Date(),
      };
    }

    return {
      document: docRecord,
      filePath,
      pdfBuffer,
      fileName: safeName,
    };
  } finally {
    await page.close();
  }
}
