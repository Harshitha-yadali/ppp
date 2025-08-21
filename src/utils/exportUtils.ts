// src/utils/exportUtils.ts

// Existing imports (keep them as they are)
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { ResumeData, UserType } from '../types/resume';
import { ExportOptions, defaultExportOptions } from '../types/export';

// Helper function to convert mm to px (1mm = 3.779528px at 96 DPI)
const mmToPx = (mm: number) => mm * 3.779528;

// Helper function to convert pt to px (1pt = 1.333px at 96 DPI)
const ptToPx = (pt: number) => pt * 1.333;

export const exportToPDF = async (
  resumeData: ResumeData,
  userType: UserType = 'experienced',
  options: ExportOptions = defaultExportOptions
): Promise<void> => {
  try {
    // Create a temporary container for the resume content
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      width: 794px;
      padding: ${options.template === 'minimalist' ? '30px' : '20px'} 30px 40px;
      font-family: ${options.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      font-size: ${options.bodyTextSize}pt;
      line-height: 1.25;
      color: #000;
      background: white;
      position: absolute;
      top: -9999px;
      left: -9999px;
      page-break-inside: avoid;
    `;

    // Generate HTML content based on template
    tempContainer.innerHTML = generateResumeHTML(resumeData, userType, options);
    
    document.body.appendChild(tempContainer);

    // Use html2canvas to convert the HTML to canvas
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(tempContainer, {
      scale: 2.5,
      width: 794,
      height: Math.min(tempContainer.scrollHeight, 1123),
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Remove the temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const margin = options.template === 'minimalist' ? 20 : 15; // Larger margins for minimalist
    const imgWidth = pdfWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const maxContentHeight = pdfHeight - 2 * margin;

    let yPosition = margin;

    if (imgHeight <= maxContentHeight) {
      // Single page
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
    } else {
      // Multiple pages
      let heightLeft = imgHeight;
      let position = margin;

      while (heightLeft > 0) {
        if (position !== margin) {
          pdf.addPage();
          position = margin;
        }
        
        const sourceY = imgHeight - heightLeft;
        const pageHeight = Math.min(heightLeft, maxContentHeight);
        
        // Create a new canvas for this page section
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = (pageHeight * canvas.width) / imgWidth;
        
        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0, (sourceY * canvas.width) / imgWidth,
            canvas.width, pageCanvas.height,
            0, 0,
            canvas.width, pageCanvas.height
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png');
          pdf.addImage(pageImgData, 'PNG', margin, position, imgWidth, pageHeight);
        }
        
        heightLeft -= maxContentHeight;
      }
    }

    // Generate filename
    const templateName = options.template.replace('_', '-');
    const fileName = `${resumeData.name.replace(/\s+/g, '_')}_Resume_${templateName}.pdf`;
    
    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
};

export const exportToWord = (
  resumeData: ResumeData,
  userType: UserType = 'experienced',
  options: ExportOptions = defaultExportOptions
): void => {
  try {
    // Generate HTML content
    const htmlContent = generateResumeHTML(resumeData, userType, options);
    
    // Create Word document content
    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Resume</title>
        <style>
          body { 
            font-family: ${options.fontFamily}, Calibri, sans-serif; 
            font-size: ${options.bodyTextSize}pt; 
            line-height: 1.25; 
            margin: ${options.template === 'minimalist' ? '1in' : '0.75in'};
          }
          .resume-two-column-content { display: flex; gap: 20px; }
          .resume-main-column { flex: 2; }
          .resume-sidebar-column { flex: 1; background: #f8f9fa; padding: 15px; border-radius: 8px; }
          h1 { font-size: ${options.nameSize}pt; text-align: center; margin-bottom: 10pt; }
          h2 { font-size: ${options.sectionHeaderSize}pt; margin-top: ${options.sectionSpacing * 2.83}pt; margin-bottom: ${options.sectionSpacing * 1.42}pt; }
          .contact-info { text-align: center; margin-bottom: 15pt; }
          ul { margin-left: 20pt; }
          li { margin-bottom: ${options.entrySpacing * 1.42}pt; }
        </style>
      </head>
      <body>${htmlContent}</body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([wordContent], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    const templateName = options.template.replace('_', '-');
    const fileName = `${resumeData.name.replace(/\s+/g, '_')}_Resume_${templateName}.docx`;
    
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw new Error('Failed to export Word document. Please try again.');
  }
};

const generateResumeHTML = (
  resumeData: ResumeData,
  userType: UserType,
  options: ExportOptions
): string => {
  const template = options.template;
  
  // Build contact information
  const contactParts: string[] = [];
  if (resumeData.email) contactParts.push(resumeData.email);
  if (resumeData.phone) contactParts.push(resumeData.phone);
  if (resumeData.location) contactParts.push(resumeData.location);
  if (resumeData.linkedin) contactParts.push(resumeData.linkedin);
  if (resumeData.github) contactParts.push(resumeData.github);
  
  const contactInfo = contactParts.join(' | ');

  // Generate sections based on template
  const generateSection = (sectionName: string): string => {
    switch (sectionName) {
      case 'summary':
        if (userType === 'student' && resumeData.careerObjective) {
          return `
            <div class="section">
              <h2>CAREER OBJECTIVE</h2>
              <p>${resumeData.careerObjective}</p>
            </div>
          `;
        } else if (resumeData.summary) {
          return `
            <div class="section">
              <h2>${template === 'functional' ? 'PROFESSIONAL PROFILE' : 'PROFESSIONAL SUMMARY'}</h2>
              <p>${resumeData.summary}</p>
            </div>
          `;
        }
        return '';

      case 'workExperience':
        if (!resumeData.workExperience || resumeData.workExperience.length === 0) return '';
        
        const experienceTitle = template === 'functional' ? 'WORK HISTORY' : 
                               userType === 'fresher' || userType === 'student' ? 'INTERNSHIPS & TRAINING' : 'PROFESSIONAL EXPERIENCE';
        
        return `
          <div class="section">
            <h2>${experienceTitle}</h2>
            ${resumeData.workExperience.map(job => `
              <div class="experience-item">
                <div class="job-header">
                  <div>
                    <div class="job-title">${job.role}</div>
                    <div class="company">${job.company}${job.location ? `, ${job.location}` : ''}</div>
                  </div>
                  <div class="date">${job.year}</div>
                </div>
                ${template !== 'functional' && job.bullets ? `
                  <ul>
                    ${job.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                  </ul>
                ` : template === 'functional' && job.bullets ? `
                  <p style="margin-left: 10px;">${job.bullets[0]}</p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `;

      case 'education':
        if (!resumeData.education || resumeData.education.length === 0) return '';
        
        return `
          <div class="section">
            <h2>EDUCATION</h2>
            ${resumeData.education.map(edu => `
              <div class="education-item">
                <div class="education-header">
                  <div>
                    <div class="degree">${edu.degree}</div>
                    <div class="school">${edu.school}${edu.location ? `, ${edu.location}` : ''}</div>
                    ${edu.cgpa ? `<div class="cgpa">CGPA: ${edu.cgpa}</div>` : ''}
                  </div>
                  <div class="date">${edu.year}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;

      case 'skills':
        if (!resumeData.skills || resumeData.skills.length === 0) return '';
        
        const isSkillsFocused = template === 'functional' || template === 'combination';
        const skillsTitle = isSkillsFocused ? 'KEY SKILLS' : 'TECHNICAL SKILLS';
        
        if (template === 'two_column_safe') {
          return `
            <div class="sidebar-section">
              <h3>${skillsTitle}</h3>
              ${resumeData.skills.map(skill => `
                <div class="skill-item">
                  <div class="skill-category">${skill.category}</div>
                  <div class="skill-list">${skill.list?.join(' • ') || ''}</div>
                </div>
              `).join('')}
            </div>
          `;
        }
        
        return `
          <div class="section">
            <h2>${skillsTitle}</h2>
            ${isSkillsFocused ? `
              <div class="skills-grid">
                ${resumeData.skills.map(skill => `
                  <div class="skill-box">
                    <div class="skill-category">${skill.category}</div>
                    <div class="skill-list">${skill.list?.join(' • ') || ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : `
              ${resumeData.skills.map(skill => `
                <div class="skill-item">
                  <strong>• ${skill.category}:</strong> ${skill.list?.join(', ') || ''}
                </div>
              `).join('')}
            `}
          </div>
        `;

      case 'projects':
        if (!resumeData.projects || resumeData.projects.length === 0) return '';
        
        const isProjectsFocused = template === 'combination' || template === 'functional';
        const projectsTitle = isProjectsFocused ? 'RELEVANT PROJECTS' : 
                             userType === 'fresher' || userType === 'student' ? 'ACADEMIC PROJECTS' : 'PROJECTS';
        
        return `
          <div class="section">
            <h2>${projectsTitle}</h2>
            ${resumeData.projects.map(project => `
              <div class="project-item ${isProjectsFocused ? 'project-highlighted' : ''}">
                <div class="project-title">${project.title}</div>
                ${project.bullets ? `
                  <ul>
                    ${project.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `;

      case 'certifications':
        if (!resumeData.certifications || resumeData.certifications.length === 0) return '';
        
        if (template === 'two_column_safe') {
          return `
            <div class="sidebar-section">
              <h3>CERTIFICATIONS</h3>
              ${resumeData.certifications.map(cert => `
                <div class="cert-item">• ${typeof cert === 'string' ? cert : cert.title || cert}</div>
              `).join('')}
            </div>
          `;
        }
        
        return `
          <div class="section">
            <h2>CERTIFICATIONS</h2>
            <ul>
              ${resumeData.certifications.map(cert => `
                <li>${typeof cert === 'string' ? cert : cert.title || cert}</li>
              `).join('')}
            </ul>
          </div>
        `;

      case 'achievementsAndExtras':
        const hasAchievements = resumeData.achievements && resumeData.achievements.length > 0;
        const hasExtraCurricular = resumeData.extraCurricularActivities && resumeData.extraCurricularActivities.length > 0;
        const hasLanguages = resumeData.languagesKnown && resumeData.languagesKnown.length > 0;
        
        if (!hasAchievements && !hasExtraCurricular && !hasLanguages) return '';
        
        return `
          <div class="section">
            <h2>ADDITIONAL INFORMATION</h2>
            ${hasAchievements ? `
              <div class="subsection">
                <h4>Achievements:</h4>
                <ul>
                  ${resumeData.achievements!.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${hasExtraCurricular ? `
              <div class="subsection">
                <h4>Extra-curricular Activities:</h4>
                <ul>
                  ${resumeData.extraCurricularActivities!.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${hasLanguages ? `
              <div class="subsection">
                <h4>Languages Known:</h4>
                <p>${resumeData.languagesKnown!.join(', ')}</p>
              </div>
            ` : ''}
          </div>
        `;

      default:
        return '';
    }
  };

  // Header HTML
  const headerHTML = `
    <div class="header" style="text-align: center; margin-bottom: 20px;">
      <h1 style="
        font-size: ${options.nameSize}pt;
        font-weight: bold;
        letter-spacing: ${template === 'minimalist' ? '2pt' : '1pt'};
        margin-bottom: 8px;
        text-transform: ${template === 'minimalist' ? 'none' : 'uppercase'};
      ">${resumeData.name}</h1>
      ${contactInfo ? `
        <div class="contact-info" style="
          font-size: ${options.bodyTextSize - 0.5}pt;
          margin-bottom: 10px;
        ">${contactInfo}</div>
      ` : ''}
      ${template !== 'minimalist' ? '<hr style="border: 0.5pt solid #404040; margin: 10px auto; width: 90%;">' : ''}
    </div>
  `;

  // Generate content based on template
  if (template === 'two_column_safe') {
    const mainSections = ['summary', 'workExperience', 'education'];
    const sidebarSections = ['skills', 'certifications', 'achievementsAndExtras'];
    
    return `
      <div class="resume-container">
        ${headerHTML}
        <div class="resume-two-column-content">
          <div class="resume-main-column">
            ${mainSections.map(section => generateSection(section)).join('')}
          </div>
          <div class="resume-sidebar-column">
            ${sidebarSections.map(section => generateSection(section)).join('')}
          </div>
        </div>
      </div>
      <style>
        .resume-two-column-content { display: flex; gap: 20px; }
        .resume-main-column { flex: 2; }
        .resume-sidebar-column { flex: 1; background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .sidebar-section { margin-bottom: 20px; }
        .sidebar-section h3 { font-size: ${options.sectionHeaderSize}pt; font-weight: bold; margin-bottom: 8px; }
        .skill-item, .cert-item { margin-bottom: 8px; font-size: ${options.bodyTextSize}pt; }
        .skill-category { font-weight: bold; margin-bottom: 4px; }
        .skill-list { color: #666; }
      </style>
    `;
  } else {
    // One-column templates
    const sectionOrder = getSectionOrderForTemplate(template, userType);
    
    return `
      <div class="resume-container template-${template}">
        ${headerHTML}
        ${sectionOrder.map(section => generateSection(section)).join('')}
      </div>
      <style>
        .section { margin-bottom: ${options.sectionSpacing * 2.83}pt; }
        .section h2 { 
          font-size: ${options.sectionHeaderSize}pt; 
          font-weight: bold; 
          margin-bottom: ${options.sectionSpacing * 1.42}pt;
          ${template === 'minimalist' ? 'border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;' : ''}
        }
        .experience-item, .project-item, .education-item { margin-bottom: ${options.entrySpacing * 2.83}pt; }
        .job-header, .education-header { display: flex; justify-content: space-between; margin-bottom: 4pt; }
        .job-title, .degree { font-weight: bold; font-size: ${options.subHeaderSize}pt; }
        .company, .school { font-size: ${options.subHeaderSize}pt; }
        .date { font-size: ${options.subHeaderSize}pt; }
        .project-title { font-weight: bold; font-size: ${options.subHeaderSize}pt; margin-bottom: 4pt; }
        ul { padding-left: 24px; list-style-position: inside; margin: 0; list-style-type: disc; }
        li { margin-bottom: ${options.entrySpacing * 1.42}pt; font-size: ${options.bodyTextSize}pt; padding-left: 20px; text-indent: -20px; line-height: 1.5; }


        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .skill-box { background: #f8f9fa; padding: 10px; border-radius: 4px; }
        .skill-category { font-weight: bold; margin-bottom: 4px; }
        .project-highlighted { background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #e9ecef; }
        .template-chronological .experience-item { border-left: 2px solid #e5e7eb; padding-left: 10px; }
        .template-minimalist .section { margin-bottom: ${options.sectionSpacing * 4}pt; }
      </style>
    `;
  }
};

const getSectionOrderForTemplate = (template: string, userType: UserType): string[] => {
  switch (template) {
    case 'chronological':
      return ['summary', 'workExperience', 'education', 'skills', 'projects', 'achievementsAndExtras'];
    case 'functional':
      return ['summary', 'skills', 'projects', 'workExperience', 'education'];
    case 'combination':
      return ['summary', 'skills', 'projects', 'workExperience', 'education'];
    case 'minimalist':
      if (userType === 'student' || userType === 'fresher') {
        return ['summary', 'education', 'projects', 'skills', 'workExperience'];
      }
      return ['summary', 'workExperience', 'education', 'skills', 'projects'];
    default:
      return ['summary', 'workExperience', 'education', 'skills', 'projects', 'achievementsAndExtras'];
  }
};

// NEW FUNCTION: generateResumeLayout
export function generateResumeLayout(
  templateType: TemplateType,
  userType: UserType,
  resumeData: ResumeData
): any {
  const tokens = {
    page: { width_px: 794, pad_x_px: 28, pad_y_px: 32, bg: "#FFFFFF" },
    font_stack: "Inter, Calibri, Segoe UI, Arial, sans-serif",
    colors: {
      text_primary: "#111827",
      text_muted: "#6B7280",
      accent: "#14532D",
      rule: "#E5E7EB",
      chip_bg: "#F3F4F6"
    },
    type: {
      name_px: 26,
      title_px: 14,
      section_px: 12,
      body_px: 12,
      meta_px: 11,
      line_height: 1.5,
      letter_spacing_name_px: 0.5,
      letter_spacing_section_px: 0.5
    },
    space_px: {
      section_top: 18,
      section_title_bottom: 8,
      between_items: 12,
      bullet_gap: 6,
      contact_bottom: 14,
      name_bottom: 6,
      title_bottom: 10,
      indent_list: 18,
      left_rail_pad: 10
    },
    decor: {
      show_header_rule: true,
      left_rail_border_px: 0 // Default, will be set conditionally
    }
  };

  let sectionOrder: string[] = [];
  let htmlBody = '';
  let leftRailBorderPx = 0; // Default for functional, two_column_safe

  // --- Helper Functions (internal to generateResumeLayout) ---

  function _generateContactLine(data: ResumeData): string {
    const parts: string[] = [];
    if (data.email) parts.push(data.email);
    if (data.phone) parts.push(data.phone);
    if (data.location) parts.push(data.location);
    if (data.linkedin) parts.push(data.linkedin);
    if (data.github) parts.push(data.github);
    return parts.join(' • ');
  }

  function _generateExperienceHtml(
    workExperience: Array<any>,
    currentTemplateType: TemplateType
  ): string {
    if (!workExperience || workExperience.length === 0) return '';
    return workExperience.map(job => {
      let bulletsHtml = '';
      if (job.bullets && job.bullets.length > 0) {
        if (currentTemplateType === 'functional') {
          // Functional: 0-2 bullets max
          const functionalBullets = job.bullets.slice(0, 2);
          bulletsHtml = `<ul class="list">${functionalBullets.map((b: string) => `<li>${b}</li>`).join('')}</ul>`;
        } else {
          // Other templates: full bullets
          bulletsHtml = `<ul class="list">${job.bullets.map((b: string) => `<li>${b}</li>`).join('')}</ul>`;
        }
      }
      return `
        <div class="item">
          <div class="row">
            <div class="left">${job.role} — ${job.company}</div>
            <div class="right">${job.year}</div>
          </div>
          ${bulletsHtml}
        </div>
      `;
    }).join('');
  }

  function _generateEducationHtml(education: Array<any>): string {
    if (!education || education.length === 0) return '';
    return education.map(edu => `
      <div class="item">
        <div class="row">
          <div class="left">${edu.degree}, ${edu.school}</div>
          <div class="right">${edu.year}</div>
        </div>
      </div>
    `).join('');
  }

  function _generateSkillsHtml(skills: Array<any>, currentTemplateType: TemplateType): string {
    if (!skills || skills.length === 0) return '';

    if (currentTemplateType === 'functional' || currentTemplateType === 'combination') {
      // Grouped by category in boxes
      return skills.map(skill => `
        <div class="tagbox">
          <div class="cat">${skill.category}</div>
          <div class="vals">${skill.list.join(', ')}</div>
        </div>
      `).join('');
    } else {
      // Simple list or inline chips
      const allSkills = skills.flatMap(skill => skill.list);
      return allSkills.map(skill => `<span class="tag">${skill}</span>`).join('');
    }
  }

  function _generateProjectsHtml(projects: Array<any>, currentTemplateType: TemplateType): string {
    if (!projects || projects.length === 0) return '';
    return projects.map(project => `
      <div class="item ${currentTemplateType === 'combination' ? 'project-highlighted' : ''}">
        <div class="row">
          <div class="left">${project.title}</div>
          <div class="right">${project.year || ''}</div>
        </div>
        <ul class="list">${project.bullets.map((b: string) => `<li>${b}</li>`).join('')}</ul>
      </div>
    `).join('');
  }

  function _generateOptionalSection(sectionKey: string, items: string[], column?: 'sidebar'): string {
    if (!items || items.length === 0) return '';
    let title = '';
    let content = '';

    switch (sectionKey) {
      case 'certifications':
        title = 'Certifications';
        content = `<ul class="list">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
        break;
      case 'extras':
        title = 'Additional Information';
        content = `<ul class="list">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
        break;
      case 'links':
        title = 'Links';
        content = `<ul class="list">${items.map(item => `<li><a href="${item}" target="_blank">${item}</a></li>`).join('')}</ul>`;
        break;
      default:
        return '';
    }

    return `
      <section class="${sectionKey}">
        <div class="section-title">${title}</div>
        ${content}
      </section>
    `;
  }

  function _getExtraItems(data: ResumeData): string[] {
    const items: string[] = [];
    if (data.achievements && data.achievements.length > 0) {
      items.push(...data.achievements);
    }
    if (data.extraCurricularActivities && data.extraCurricularActivities.length > 0) {
      items.push(...data.extraCurricularActivities);
    }
    if (data.languagesKnown && data.languagesKnown.length > 0) {
      items.push(...data.languagesKnown);
    }
    if (data.personalDetails) {
      items.push(data.personalDetails);
    }
    return items;
  }

  function _getLinks(data: ResumeData): string[] {
    const links: string[] = [];
    if (data.linkedin) links.push(data.linkedin);
    if (data.github) links.push(data.github);
    return links;
  }

  // --- Template-Specific Logic ---
  switch (templateType) {
    case 'chronological':
      sectionOrder = ["summary", "work_experience", "education", "skills", "certifications", "extras"];
      leftRailBorderPx = 2;
      htmlBody = `
        <div class="header">
          <div class="name">${resumeData.name}</div>
          <div class="title">${resumeData.title || ''}</div>
          <div class="contact">${_generateContactLine(resumeData)}</div>
          <div class="rule"></div>
        </div>
        <section class="summary">
          <div class="section-title">Summary</div>
          <p class="p">${resumeData.summary || ''}</p>
        </section>
        <section class="experience">
          <div class="section-title">Work Experience</div>
          <div class="rail">${_generateExperienceHtml(resumeData.workExperience || [], templateType)}</div>
        </section>
        <section class="education">
          <div class="section-title">Education</div>
          ${_generateEducationHtml(resumeData.education || [])}
        </section>
        <section class="skills">
          <div class="section-title">Skills</div>
          <div class="tags">${_generateSkillsHtml(resumeData.skills || [], templateType)}</div>
        </section>
        ${_generateOptionalSection('certifications', resumeData.certifications || [])}
        ${_generateOptionalSection('extras', _getExtraItems(resumeData))}
      `;
      break;

    case 'functional':
      sectionOrder = ["summary", "skills", "projects", "work_history", "education", "certifications", "extras"];
      leftRailBorderPx = 0;
      htmlBody = `
        <div class="header">
          <div class="name">${resumeData.name}</div>
          <div class="title">${resumeData.title || ''}</div>
          <div class="contact">${_generateContactLine(resumeData)}</div>
          <div class="rule"></div>
        </div>
        <section class="summary">
          <div class="section-title">Professional Profile</div>
          <p class="p">${resumeData.summary || resumeData.careerObjective || ''}</p>
        </section>
        <section class="skills">
          <div class="section-title">Key Skills</div>
          <div class="tags">${_generateSkillsHtml(resumeData.skills || [], templateType)}</div>
        </section>
        <section class="projects">
          <div class="section-title">Relevant Projects</div>
          ${_generateProjectsHtml(resumeData.projects || [], templateType)}
        </section>
        <section class="work">
          <div class="section-title">Work History</div>
          ${_generateExperienceHtml(resumeData.workExperience || [], templateType)}
        </section>
        <section class="education">
          <div class="section-title">Education</div>
          ${_generateEducationHtml(resumeData.education || [])}
        </section>
        ${_generateOptionalSection('certifications', resumeData.certifications || [])}
        ${_generateOptionalSection('extras', _getExtraItems(resumeData))}
      `;
      break;

    case 'combination':
      sectionOrder = ["summary", "skills", "projects", "work_experience", "education", "certifications", "extras"];
      leftRailBorderPx = 0;
      htmlBody = `
        <div class="header">
          <div class="name">${resumeData.name}</div>
          <div class="title">${resumeData.title || ''}</div>
          <div class="contact">${_generateContactLine(resumeData)}</div>
          <div class="rule"></div>
        </div>
        <section class="summary">
          <div class="section-title">Summary</div>
          <p class="p">${resumeData.summary || ''}</p>
        </section>
        <section class="skills">
          <div class="section-title">Key Skills</div>
          <div class="tags">${_generateSkillsHtml(resumeData.skills || [], templateType)}</div>
        </section>
        <section class="projects">
          <div class="section-title">Projects</div>
          ${_generateProjectsHtml(resumeData.projects || [], templateType)}
        </section>
        <section class="experience">
          <div class="section-title">Work Experience</div>
          ${_generateExperienceHtml(resumeData.workExperience || [], templateType)}
        </section>
        <section class="education">
          <div class="section-title">Education</div>
          ${_generateEducationHtml(resumeData.education || [])}
        </section>
        ${_generateOptionalSection('certifications', resumeData.certifications || [])}
        ${_generateOptionalSection('extras', _getExtraItems(resumeData))}
      `;
      break;

    case 'minimalist':
      if (userType === 'fresher' || userType === 'student') {
        sectionOrder = ["summary", "education", "projects", "skills", "work_experience", "certifications", "extras"];
      } else { // experienced
        sectionOrder = ["summary", "work_experience", "education", "skills", "certifications", "extras"];
      }
      leftRailBorderPx = 2;
      htmlBody = `
        <div class="header">
          <div class="name">${resumeData.name}</div>
          <div class="title">${resumeData.title || ''}</div>
          <div class="contact">${_generateContactLine(resumeData)}</div>
          <div class="rule"></div>
        </div>
        <section class="summary">
          <div class="section-title">${userType === 'student' ? 'Career Objective' : 'Summary'}</div>
          <p class="p">${resumeData.summary || resumeData.careerObjective || ''}</p>
        </section>
        ${sectionOrder.includes('education') ? `<section class="education"><div class="section-title">Education</div>${_generateEducationHtml(resumeData.education || [])}</section>` : ''}
        ${sectionOrder.includes('projects') ? `<section class="projects"><div class="section-title">Projects</div>${_generateProjectsHtml(resumeData.projects || [], templateType)}</section>` : ''}
        ${sectionOrder.includes('skills') ? `<section class="skills"><div class="section-title">Skills</div><div class="tags">${_generateSkillsHtml(resumeData.skills || [], templateType)}</div></section>` : ''}
        ${sectionOrder.includes('work_experience') ? `<section class="experience"><div class="section-title">Work Experience</div><div class="rail">${_generateExperienceHtml(resumeData.workExperience || [], templateType)}</div></section>` : ''}
        ${_generateOptionalSection('certifications', resumeData.certifications || [])}
        ${_generateOptionalSection('extras', _getExtraItems(resumeData))}
      `;
      break;

    case 'two_column_safe':
      sectionOrder = ["summary", "main_column", "sidebar_column", "extras"];
      leftRailBorderPx = 0;
      htmlBody = `
        <div class="header">
          <div class="name">${resumeData.name}</div>
          <div class="title">${resumeData.title || ''}</div>
          <div class="contact">${_generateContactLine(resumeData)}</div>
          <div class="rule"></div>
        </div>
        <section class="summary">
          <div class="section-title">Summary</div>
          <p class="p">${resumeData.summary || ''}</p>
        </section>
        <div class="grid-container">
          <div class="main-column">
            <section class="experience">
              <div class="section-title">Work Experience</div>
              ${_generateExperienceHtml(resumeData.workExperience || [], templateType)}
            </section>
            <section class="education">
              <div class="section-title">Education</div>
              ${_generateEducationHtml(resumeData.education || [])}
            </section>
          </div>
          <div class="sidebar-column">
            <section class="skills">
              <div class="section-title">Skills</div>
              <div class="tags">${_generateSkillsHtml(resumeData.skills || [], templateType)}</div>
            </section>
            ${_generateOptionalSection('links', _getLinks(resumeData), 'sidebar')}
            ${_generateOptionalSection('certifications', resumeData.certifications || [], 'sidebar')}
          </div>
        </div>
        ${_generateOptionalSection('extras', _getExtraItems(resumeData))}
      `;
      break;

    default:
      throw new Error("Invalid TEMPLATE_TYPE provided.");
  }

  // Set the left_rail_border_px in tokens
  tokens.decor.left_rail_border_px = leftRailBorderPx;

  return {
    template_id: `${templateType}_v1`,
    tokens: tokens,
    section_order: sectionOrder,
    css: {
      root_class: "resume-root",
      rules: [
        ".resume-root{max-width:794px;margin:0 auto;background:#FFFFFF;color:#111827;padding:32px 28px;font-family:Inter,Calibri,'Segoe UI',Arial,sans-serif;}",
        ".name{font-size:26px;font-weight:700;letter-spacing:.5px;margin-bottom:6px;}",
        ".title{font-size:14px;font-weight:600;text-transform:uppercase;margin-bottom:10px;}",
        ".contact{font-size:11px;font-weight:500;color:#6B7280;margin-bottom:14px;display:flex;flex-wrap:wrap;gap:8px;}",
        ".rule{border:0;height:1px;background:#E5E7EB;margin:10px 0 14px;}",
        ".section-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#14532D;margin-top:18px;margin-bottom:8px;}",
        ".p{font-size:12px;line-height:1.5;margin-bottom:8px;}",

        /* NEW header grid for each job */
        ".row{display:grid;grid-template-columns:1fr max-content;column-gap:16px;align-items:baseline;}",
        ".row .left{font-size:13px;font-weight:600;}",
        ".row .right{font-size:11px;font-weight:500;color:#6B7280;white-space:nowrap;}",

        /* NEW hanging bullets */
        ".list{list-style:disc;margin:0;padding-left:16px;font-size:12px;line-height:1.55;}",
        ".list li{margin:0 0 6px 0;padding-left:6px;text-indent:-6px;}",
        ".list li::marker{font-size:12px;color:#111827;}",
        ".list--tight li{margin-bottom:4px;}",

        /* NEW rhythm + readable measure */
        ".item{margin-bottom:14px;}",
        ".item .row{margin-bottom:4px;}",
        ".rail{border-left:2px solid #E5E7EB;padding-left:10px;max-width:72ch;}",

        /* chips / boxes unchanged */
        ".tags{display:flex;flex-wrap:wrap;gap:6px;}",
        ".tag{font-size:11px;font-weight:600;color:#111827;background:#F3F4F6;border-radius:4px;padding:4px 8px;}",
        ".tagbox{background:#F3F4F6;border-radius:8px;padding:10px;}",
        ".tagbox .cat{font-size:12px;font-weight:700;margin-bottom:6px;}",
        ".tagbox .vals{font-size:12px;color:#111827;}",
        ".project-highlighted{background:#F3F4F6;border-radius:8px;padding:12px;border:1px solid #E5E7EB;}",
        `.grid-container{display:grid;grid-template-columns:2fr 1fr;gap:24px;}`,
        `.main-column{display:flex;flex-direction:column;}`,
        `.sidebar-column{display:flex;flex-direction:column;}`
      ]
    },
    html: {
      body: htmlBody
    }
  };
}
