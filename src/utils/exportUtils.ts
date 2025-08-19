import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { ResumeData, UserType } from '../types/resume';
import { ExportOptions, defaultExportOptions } from '../types/export';

const mmToPx = (mm: number) => mm * 3.779528;

const pagePx = { w: mmToPx(210), h: mmToPx(297) };

const pick = <T extends object, K extends keyof T>(obj: T | undefined, keys: K[], fallback: Record<string, string> = {}) =>
  (obj ? keys.map(k => obj[k] as unknown as string).filter(Boolean) : []).join(' | ') || Object.values(fallback).join(' | ');

export const exportToPDF = async (
  resumeData: ResumeData,
  userType: UserType = 'experienced',
  options: ExportOptions = defaultExportOptions
): Promise<void> => {
  const container = document.createElement('div');
  container.style.cssText = `
    width:${Math.round(pagePx.w)}px;
    padding:${options.template === 'minimalist' ? '30px' : '20px'} 32px 40px;
    font-family:${options.fontFamily},Segoe UI,Tahoma,Geneva,Verdana,sans-serif;
    font-size:${options.bodyTextSize}pt;line-height:1.35;color:#000;background:#fff;position:fixed;inset:auto -200vw auto auto;
  `;
  container.innerHTML = generateResumeHTML(resumeData, userType, options);
  document.body.appendChild(container);

  const html2canvas = (await import('html2canvas')).default;
  const scale = 2;
  const canvas = await html2canvas(container, {
    scale,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    width: Math.round(pagePx.w),
    height: container.scrollHeight
  });

  document.body.removeChild(container);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const marginMm = options.template === 'minimalist' ? 18 : 12;
  const pw = 210 - marginMm * 2;
  const ph = 297 - marginMm * 2;

  const imgWpx = canvas.width;
  const imgHpx = canvas.height;
  const ratio = pw / 210;
  const drawWpx = imgWpx;
  const pxPerMm = imgWpx / 210;
  const pageSlicePx = Math.floor(ph * pxPerMm);

  let offsetPx = 0;
  let first = true;

  while (offsetPx < imgHpx) {
    const sliceH = Math.min(pageSlicePx, imgHpx - offsetPx);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = imgWpx;
    pageCanvas.height = sliceH;
    const ctx = pageCanvas.getContext('2d')!;
    ctx.drawImage(canvas, 0, offsetPx, imgWpx, sliceH, 0, 0, imgWpx, sliceH);
    const pageImg = pageCanvas.toDataURL('image/png');
    if (!first) pdf.addPage();
    first = false;
    const drawH = (sliceH / pxPerMm);
    pdf.addImage(pageImg, 'PNG', marginMm, marginMm, pw, drawH, undefined, 'FAST');
    offsetPx += sliceH;
  }

  const name = (resumeData as any).name || 'Resume';
  const templateName = options.template.replace(/_/g, '-');
  pdf.save(`${name.replace(/\s+/g, '_')}_Resume_${templateName}.pdf`);
};

export const exportToWord = (
  resumeData: ResumeData,
  userType: UserType = 'experienced',
  options: ExportOptions = defaultExportOptions
): void => {
  const html = generateResumeHTML(resumeData, userType, options);
  const doc = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>Resume</title>
    <style>
      body{font-family:${options.fontFamily},Calibri,sans-serif;font-size:${options.bodyTextSize}pt;line-height:1.35;margin:${options.template==='minimalist'?'1in':'0.8in'}}
      h1{font-size:${options.nameSize}pt;margin:0 0 8pt 0;${options.template==='minimalist'?'letter-spacing:1pt;text-transform:none;':'letter-spacing:0.5pt;text-transform:uppercase;'}}
      h2{font-size:${options.sectionHeaderSize}pt;margin:${options.sectionSpacing*2.5}pt 0 ${options.sectionSpacing*1.2}pt 0}
      .header{text-align:center;margin-bottom:14pt}
      .contact{font-size:${options.bodyTextSize-0.5}pt}
      .section{margin-bottom:${options.sectionSpacing*3}pt}
      .row{display:flex;justify-content:space-between;gap:12pt}
      .left{flex:2}
      .right{flex:1;background:#f6f7f9;padding:12pt;border-radius:6pt}
      .two-col{display:flex;gap:16pt}
      .main{flex:2}
      .side{flex:1;background:#f6f7f9;padding:12pt;border-radius:6pt}
      ul{margin:6pt 0 0 18pt}
      li{margin:4pt 0}
      .item{margin-bottom:${options.entrySpacing*2.5}pt}
      .title{font-weight:700;font-size:${options.subHeaderSize}pt}
      .meta{font-size:${options.subHeaderSize-1}pt;color:#444}
      hr{border:0;border-top:0.75pt solid #404040;margin:10pt auto;width:90%}
    </style>
  </head>
  <body>${html}</body></html>`;
  const blob = new Blob([doc], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const name = (resumeData as any).name || 'Resume';
  const templateName = options.template.replace(/_/g, '-');
  saveAs(blob, `${name.replace(/\s+/g, '_')}_Resume_${templateName}.docx`);
};

const text = (v?: string) => (v ? String(v) : '');

const genWork = (data: any, template: string, userType: UserType, sizes: any) => {
  const list = data?.workExperience || [];
  if (!list.length) return '';
  const title =
    template === 'functional'
      ? 'WORK HISTORY'
      : userType === 'fresher' || userType === 'student'
      ? 'INTERNSHIPS & TRAINING'
      : 'PROFESSIONAL EXPERIENCE';
  return `
  <div class="section">
    <h2>${title}</h2>
    ${list
      .map(
        (j: any) => `
      <div class="item">
        <div class="row">
          <div><div class="title">${text(j.role)}</div><div class="meta">${text(j.company)}${j.location ? ', ' + text(j.location) : ''}</div></div>
          <div class="meta">${text(j.year)}</div>
        </div>
        ${
          template !== 'functional' && Array.isArray(j.bullets)
            ? `<ul>${j.bullets.map((b: string) => `<li>${b}</li>`).join('')}</ul>`
            : Array.isArray(j.bullets) && j.bullets[0]
            ? `<div class="meta" style="margin-top:4pt">${j.bullets[0]}</div>`
            : ''
        }
      </div>`
      )
      .join('')}
  </div>`;
};

const genEdu = (data: any) => {
  const list = data?.education || [];
  if (!list.length) return '';
  return `
  <div class="section">
    <h2>EDUCATION</h2>
    ${list
      .map(
        (e: any) => `
      <div class="item">
        <div class="row">
          <div>
            <div class="title">${text(e.degree)}</div>
            <div class="meta">${text(e.school)}${e.location ? ', ' + text(e.location) : ''}${e.cgpa ? ' • CGPA: ' + text(e.cgpa) : ''}</div>
          </div>
          <div class="meta">${text(e.year)}</div>
        </div>
      </div>`
      )
      .join('')}
  </div>`;
};

const genSkills = (data: any, template: string, sidebar = false) => {
  const list = data?.skills || [];
  if (!list.length) return '';
  const title = template === 'functional' || template === 'combination' ? 'KEY SKILLS' : 'TECHNICAL SKILLS';
  const body =
    template === 'functional' || template === 'combination'
      ? `<div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8pt">
           ${list
             .map(
               (s: any) => `<div><div class="title" style="font-size:11pt">${text(s.category)}</div>
               <div class="meta">${Array.isArray(s.list) ? s.list.join(' • ') : ''}</div></div>`
             )
             .join('')}
         </div>`
      : list
          .map(
            (s: any) =>
              `<div class="item"><strong>• ${text(s.category)}:</strong> ${Array.isArray(s.list) ? s.list.join(', ') : ''}</div>`
          )
          .join('');
  return sidebar
    ? `<div class="section side-block"><h2 style="margin-top:0">${title}</h2>${body}</div>`
    : `<div class="section"><h2>${title}</h2>${body}</div>`;
};

const genProjects = (data: any, template: string, userType: UserType) => {
  const list = data?.projects || [];
  if (!list.length) return '';
  const isFocus = template === 'combination' || template === 'functional';
  const title = isFocus ? 'RELEVANT PROJECTS' : userType === 'fresher' || userType === 'student' ? 'ACADEMIC PROJECTS' : 'PROJECTS';
  return `
  <div class="section">
    <h2>${title}</h2>
    ${list
      .map(
        (p: any) => `
      <div class="item${isFocus ? ' project-highlighted' : ''}">
        <div class="title">${text(p.title || p.name)}</div>
        ${Array.isArray(p.bullets) ? `<ul>${p.bullets.map((b: string) => `<li>${b}</li>`).join('')}</ul>` : ''}
      </div>`
      )
      .join('')}
  </div>`;
};

const genCerts = (data: any, sidebar = false) => {
  const list = data?.certifications || [];
  if (!list.length) return '';
  const body = `<ul>${list.map((c: any) => `<li>${typeof c === 'string' ? c : c.title || c}</li>`).join('')}</ul>`;
  return sidebar ? `<div class="section side-block"><h2 style="margin-top:0">CERTIFICATIONS</h2>${body}</div>` : `<div class="section"><h2>CERTIFICATIONS</h2>${body}</div>`;
};

const genAdditional = (data: any) => {
  const a = data?.achievements || [];
  const e = data?.extraCurricularActivities || [];
  const l = data?.languagesKnown || [];
  if (!a.length && !e.length && !l.length) return '';
  return `
  <div class="section">
    <h2>ADDITIONAL INFORMATION</h2>
    ${a.length ? `<div class="item"><div class="title" style="font-size:11pt">Achievements</div><ul>${a.map((x: string) => `<li>${x}</li>`).join('')}</ul></div>` : ''}
    ${e.length ? `<div class="item"><div class="title" style="font-size:11pt">Extra-curricular Activities</div><ul>${e.map((x: string) => `<li>${x}</li>`).join('')}</ul></div>` : ''}
    ${l.length ? `<div class="item"><div class="title" style="font-size:11pt">Languages</div><div class="meta">${l.join(', ')}</div></div>` : ''}
  </div>`;
};

export const generateResumeHTML = (
  resumeData: ResumeData,
  userType: UserType,
  options: ExportOptions
): string => {
  const template = options.template;
  const hdrName = (resumeData as any).name || '';
  const contactInline =
    pick(resumeData as any, ['email', 'phone', 'location', 'linkedin', 'github', 'website']) ||
    pick((resumeData as any).contact, ['email', 'phone', 'location', 'linkedin', 'github', 'website']);

  const careerObjective = (resumeData as any).careerObjective;
  const summary = (resumeData as any).summary;

  const header = `
    <div class="header">
      <h1>${hdrName}</h1>
      ${contactInline ? `<div class="contact">${contactInline}</div>` : ''}
      ${template !== 'minimalist' ? '<hr />' : ''}
    </div>
  `;

  const summaryBlock =
    userType === 'student' && careerObjective
      ? `<div class="section"><h2>CAREER OBJECTIVE</h2><div>${careerObjective}</div></div>`
      : summary
      ? `<div class="section"><h2>${template === 'functional' ? 'PROFESSIONAL PROFILE' : 'PROFESSIONAL SUMMARY'}</h2><div>${summary}</div></div>`
      : '';

  if (template === 'two_column_safe') {
    return `
    <div class="resume">
      ${header}
      <div class="two-col">
        <div class="main">
          ${summaryBlock}
          ${genWork(resumeData, template, userType, options)}
          ${genEdu(resumeData)}
        </div>
        <div class="side">
          ${genSkills(resumeData, template, true)}
          ${genCerts(resumeData, true)}
          ${genAdditional(resumeData)}
        </div>
      </div>
    </div>`;
  }

  const order = getSectionOrderForTemplate(template, userType);
  const sections = order
    .map((sec) => {
      if (sec === 'summary') return summaryBlock;
      if (sec === 'workExperience') return genWork(resumeData, template, userType, options);
      if (sec === 'education') return genEdu(resumeData);
      if (sec === 'skills') return genSkills(resumeData, template);
      if (sec === 'projects') return genProjects(resumeData, template, userType);
      if (sec === 'certifications') return genCerts(resumeData);
      if (sec === 'achievementsAndExtras') return genAdditional(resumeData);
      return '';
    })
    .join('');

  return `
  <div class="resume template-${template}">
    ${header}
    ${sections}
  </div>
  <style>
    .section{margin-bottom:${options.sectionSpacing * 12}px}
    .template-minimalist .section{margin-bottom:${options.sectionSpacing * 18}px}
    .project-highlighted{background:#f6f7f9;padding:10px;border-radius:6px;border:1px solid #e9edf2}
    .template-chronological .item{border-left:2px solid #e5e7eb;padding-left:10px}
  </style>`;
};

const getSectionOrderForTemplate = (template: string, userType: UserType): string[] => {
  if (template === 'chronological') return ['summary', 'workExperience', 'education', 'skills', 'projects', 'certifications', 'achievementsAndExtras'];
  if (template === 'functional') return ['summary', 'skills', 'projects', 'workExperience', 'education', 'certifications', 'achievementsAndExtras'];
  if (template === 'combination') return ['summary', 'skills', 'projects', 'workExperience', 'education', 'certifications', 'achievementsAndExtras'];
  if (template === 'minimalist') return userType === 'student' || userType === 'fresher' ? ['summary', 'education', 'projects', 'skills', 'workExperience', 'certifications'] : ['summary', 'workExperience', 'education', 'skills', 'projects', 'certifications'];
  return ['summary', 'workExperience', 'education', 'skills', 'projects', 'certifications', 'achievementsAndExtras'];
};
