// src/components/ResumePreview.tsx
import React from 'react';
import { ResumeData, UserType } from '../types/resume';
import { ExportOptions } from '../types/export';

interface ResumePreviewProps {
  resumeData: ResumeData;
  userType?: UserType;
  exportOptions?: ExportOptions;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData,
  userType = 'experienced',
  exportOptions
}) => {
  // Debug logging to check what data we're receiving
  console.log('ResumePreview received data:', resumeData);

  // Add validation to ensure we have valid resume data
  if (!resumeData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-gray-500 mb-4">No resume data available</div>
          <div className="text-sm text-gray-400">Please ensure your resume has been properly optimized</div>
        </div>
      </div>
    );
  }

  // Ensure we have at least a name to display
  if (!resumeData.name || resumeData.name.trim() === '') {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-gray-500 mb-4">Invalid resume data</div>
          <div className="text-sm text-gray-400">Resume name is missing or empty</div>
        </div>
      </div>
    );
  }

  // --- Moved style constants here (top of component function body) ---
  // Helper function to convert mm to px (1mm = 3.779528px at 96 DPI)
  const mmToPx = (mm: number) => mm * 3.779528;

  // Helper function to convert pt to px (1pt = 1.333px at 96 DPI)
  const ptToPx = (pt: number) => pt * 1.333;

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: exportOptions ? `${ptToPx(exportOptions.sectionHeaderSize)}px` : '13.33px', // Default 10pt converted to px
    fontWeight: 'bold',
    marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.4)}px` : '5.33px',
    marginTop: exportOptions ? `${mmToPx(exportOptions.sectionSpacing)}px` : '11.34px',
    fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    letterSpacing: '0.5pt',
    textTransform: 'uppercase'
  } as const;

  const sectionUnderlineStyle: React.CSSProperties = {
    borderBottomWidth: '0.5pt',
    borderColor: '#404040',
    height: '1px',
    marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.6)}px` : '8px'
  };

  const bodyTextStyle: React.CSSProperties = {
    fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
    fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    lineHeight: '1.25'
  };

  // Build contact information with proper separators
  const buildContactInfo = () => {
    const parts: React.ReactNode[] = [];

    if (resumeData.email) {
      parts.push(
        <span key="email" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.email}
        </span>
      );
    }

    if (resumeData.phone) {
      parts.push(
        <span key="phone" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.phone}
        </span>
      );
    }

    if (resumeData.location) {
      parts.push(
        <span key="location" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.location}
        </span>
      );
    }

    if (resumeData.linkedin) {
      parts.push(
        <span key="linkedin" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.linkedin}
        </span>
      );
    }

    if (resumeData.github) {
      parts.push(
        <span key="github" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.github}
        </span>
      );
    }

    // Join with | separator
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <span className="mx-1" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '13.33px' }}>|</span>}
      </React.Fragment>
    ));
  };

  const contactElements = buildContactInfo();

  // Define section order based on user type
  const getSectionOrder = () => {
    if (userType === 'experienced') {
      return [
        'summary', // Professional Summary
        'skills', // Technical Skills
        'workExperience', // Professional Experience
        'projects', // Projects (only if relevant/impactful)
        'certifications', // Certifications
        'education' // Education (minimal)
      ];
    } else if (userType === 'student') {
      return [
        'summary', // Career Objective (REQUIRED) - handled by 'summary' case
        'skills', // Technical Skills
        'education', // Education (PROMINENT)
        'workExperience', // Internships & Training (if any) - handled by 'workExperience' case
        'projects', // Academic Projects (IMPORTANT)
        'certifications', // Certifications
        'achievementsAndExtras' // Achievements / Leadership, Extracurricular, Languages Known (optional)
      ];
    } else { // 'fresher'
      return [
        'summary', // Career Objective (or SUMMARY if internships/strong projects) - handled by 'summary' case
        'skills', // Technical Skills
        'education', // Education
        'workExperience', // Internships & Training (if any) - handled by 'workExperience' case
        'projects', // Academic Projects
        'certifications', // Certifications
        'achievementsAndExtras' // Achievements / Leadership, Extracurricular, Languages Known (optional)
      ];
    }
  };

  const sectionOrder = getSectionOrder();

  const renderSection = (sectionName: string) => {
    // Style constants are now accessible from outside this function scope
    // No need to redefine them here.

    switch (sectionName) {
      case 'summary':
        // Conditional logic for 'Professional Summary' or 'Career Objective'
        if (userType === 'student') {
          if (!resumeData.careerObjective || resumeData.careerObjective.trim() === '') return null;
          return (
            <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
              <h2 style={sectionTitleStyle}>
                CAREER OBJECTIVE
              </h2>
              <div style={sectionUnderlineStyle}></div>
              <p style={{ ...bodyTextStyle, marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                {resumeData.careerObjective}
              </p>
            </div>
          );
        } else { // 'experienced' or 'fresher'
          if (!resumeData.summary || resumeData.summary.trim() === '') return null;
          return (
            <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
              <h2 style={sectionTitleStyle}>
                PROFESSIONAL SUMMARY
              </h2>
              <div style={sectionUnderlineStyle}></div>
              <p style={{ ...bodyTextStyle, marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                {resumeData.summary}
              </p>
            </div>
          );
        }

      case 'workExperience':
        if (!resumeData.workExperience || resumeData.workExperience.length === 0) return null;
        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              {userType === 'fresher' || userType === 'student' ? 'INTERNSHIPS & TRAINING' : 'PROFESSIONAL EXPERIENCE'}
            </h2>
            <div style={sectionUnderlineStyle}></div>

            {resumeData.workExperience.map((job, index) => (
              <div key={index} style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px' }}>
                  <div>
                    <div style={{
                      fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                      fontWeight: 'bold',
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {job.role}
                    </div>
                    <div style={{
                      fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {job.company}{job.location ? `, ${job.location}` : ''} {/* Add location */}
                    </div>
                  </div>
                  <div style={{
                    fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                    fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    {job.year}
                  </div>
                </div>
                {job.bullets && job.bullets.length > 0 && (
                  <ul style={{ marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px', listStyleType: 'disc' }}>
                    {job.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{ ...bodyTextStyle, marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.25)}px` : '1.89px' }}>
                        {typeof bullet === 'string' ? bullet : (bullet as any).description || JSON.stringify(bullet)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'education':
        if (!resumeData.education || resumeData.education.length === 0) return null;
        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              EDUCATION
            </h2>
            <div style={sectionUnderlineStyle}></div>

            {resumeData.education.map((edu, index) => (
              <div key={index} style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{
                      fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                      fontWeight: 'bold',
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {edu.degree}
                    </div>
                    <div style={{
                      fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {edu.school}{edu.location ? `, ${edu.location}` : ''}
                    </div>
                    {edu.cgpa && (
                      <div style={{
                        fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
                        fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                        color: '#4B5563'
                      }}>
                        CGPA: {edu.cgpa}
                      </div>
                    )}
                    {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                        <div style={{
                          fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
                          fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                          color: '#4B5563'
                        }}>
                          Relevant Coursework: {edu.relevantCoursework.join(', ')}
                        </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                    fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    {edu.year}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'projects':
        if (!resumeData.projects || resumeData.projects.length === 0) return null;
        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              {userType === 'fresher' || userType === 'student' ? 'ACADEMIC PROJECTS' : 'PROJECTS'}
            </h2>
            <div style={sectionUnderlineStyle}></div>

            {resumeData.projects.map((project, index) => (
              <div key={index} style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px' }}>
                <div style={{
                  fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                  fontWeight: 'bold',
                  fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                  marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px'
                }}>
                  {project.title}
                </div>
                {project.bullets && project.bullets.length > 0 && (
                  <ul style={{ marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px', listStyleType: 'disc' }}>
                    {project.bullets.map((bullet, bulletIndex) => ( // FIX: Changed 'job.bullets' to 'project.bullets'
                      <li key={bulletIndex} style={{ ...bodyTextStyle, marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.25)}px` : '1.89px' }}>
                        {typeof bullet === 'string' ? bullet : (bullet as any).description || JSON.stringify(bullet)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'skills':
        if (!resumeData.skills || resumeData.skills.length === 0) return null;
        return (
          <div style={{ marginBottom: exportOptions ?
