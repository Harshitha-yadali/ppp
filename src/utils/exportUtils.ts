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
        ul { margin-left: 20pt; list-style-type: disc; }
        li { margin-bottom: ${options.entrySpacing * 1.42}pt; font-size: ${options.bodyTextSize}pt; }
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