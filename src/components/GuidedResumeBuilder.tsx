// src/components/GuidedResumeBuilder.tsx
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  User,
  Briefcase,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  Trash2,
  Link,
  Github,
  Mail,
  Phone,
  MapPin,
  Award,
  Code,
  MessageCircle,
  TrendingUp,
  Target,
  Crown,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/paymentService';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface GuidedResumeBuilderProps {
  isAuthenticated: boolean;
  onShowAuth: () => void;
  onShowSubscriptionPlans: () => void;
  userSubscription: any;
  onShowAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error', actionText?: string, onAction?: () => void) => void;
  refreshUserSubscription: () => Promise<void>;
}

interface ResumeSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  component: React.ReactNode;
  isValid: boolean;
}

export const GuidedResumeBuilder: React.FC<GuidedResumeBuilderProps> = ({
  isAuthenticated,
  onShowAuth,
  onShowSubscriptionPlans,
  userSubscription,
  onShowAlert,
  refreshUserSubscription,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<any>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    location: '',
    careerObjective: '',
    education: [],
    workExperience: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: [],
    extraCurricularActivities: [],
    languagesKnown: [],
    personalDetails: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResumeText, setGeneratedResumeText] = useState('');
  const [showOptimizationDropdown, setShowOptimizationDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      setResumeData((prev: any) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        linkedin: user.linkedin || prev.linkedin,
        github: user.github || prev.github,
      }));
    }
  }, [user]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setResumeData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (section: string, index: number, field: string, value: any) => {
    setResumeData((prev: any) => {
      const newArray = [...prev[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  const addArrayItem = (section: string, newItem: any) => {
    setResumeData((prev: any) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setResumeData((prev: any) => {
      const newArray = prev[section].filter((_: any, i: number) => i !== index);
      return { ...prev, [section]: newArray };
    });
  };

  const generateResume = async () => {
    if (!isAuthenticated) {
      onShowAlert('Authentication Required', 'Please sign in to generate your resume.', 'error', 'Sign In', onShowAuth);
      return;
    }

    if (!userSubscription || (userSubscription.guidedBuildsTotal - userSubscription.guidedBuildsUsed) <= 0) {
      const planDetails = paymentService.getPlanById(userSubscription?.planId);
      const planName = planDetails?.name || 'your current plan';
      const guidedBuildsTotal = planDetails?.guidedBuilds || 0;

      onShowAlert(
        'Guided Build Credits Exhausted',
        `You have used all your ${guidedBuildsTotal} Guided Resume Builds from ${planName}. Please upgrade your plan to continue building resumes.`,
        'warning',
        'Upgrade Plan',
        onShowSubscriptionPlans
      );
      return;
    }

    setIsGenerating(true);
    try {
      // This is a placeholder. In a real app, you'd send resumeData to a backend/AI service
      // to generate the final resume text.
      const generatedText = `
        Name: ${resumeData.name}
        Email: ${resumeData.email}
        Phone: ${resumeData.phone}
        LinkedIn: ${resumeData.linkedin}
        GitHub: ${resumeData.github}
        Location: ${resumeData.location}

        Career Objective: ${resumeData.careerObjective}

        Education:
        ${resumeData.education.map((edu: any) => `${edu.degree} from ${edu.school} (${edu.year})`).join('\n')}

        Work Experience:
        ${resumeData.workExperience.map((exp: any) => `${exp.role} at ${exp.company} (${exp.year})\n- ${exp.bullets.join('\n- ')}`).join('\n\n')}

        Projects:
        ${resumeData.projects.map((proj: any) => `${proj.title}\n- ${proj.bullets.join('\n- ')}`).join('\n\n')}

        Skills:
        ${resumeData.skills.map((skill: any) => `${skill.category}: ${skill.list.join(', ')}`).join('\n')}

        Certifications: ${resumeData.certifications.join(', ')}
        Achievements: ${resumeData.achievements.join(', ')}
        Extra-curricular Activities: ${resumeData.extraCurricularActivities.join(', ')}
        Languages Known: ${resumeData.languagesKnown.join(', ')}
        Personal Details: ${resumeData.personalDetails}
      `;
      setGeneratedResumeText(generatedText);

      // Decrement usage count and refresh subscription
      if (userSubscription) {
        const usageResult = await paymentService.useGuidedBuild(userSubscription.userId);
        if (usageResult.success) {
          await refreshUserSubscription();
        } else {
          console.error('Failed to decrement guided build usage:', usageResult.error);
          onShowAlert('Usage Update Failed', 'Failed to record guided build usage. Please contact support.', 'error');
        }
      }

      setCurrentStep(sections.length); // Move to the final review step
    } catch (error) {
      console.error('Error generating resume:', error);
      onShowAlert('Generation Failed', `Failed to generate resume: ${error.message || 'Unknown error'}. Please try again.`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const sections: ResumeSection[] = [
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <User className="w-5 h-5" />,
      description: 'Your name, email, phone, and social links.',
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input type="text" value={resumeData.name} onChange={(e) => handleInputChange('name', '', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={resumeData.email} onChange={(e) => handleInputChange('email', '', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input type="tel" value={resumeData.phone} onChange={(e) => handleInputChange('phone', '', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile URL</label>
            <input type="url" value={resumeData.linkedin} onChange={(e) => handleInputChange('linkedin', '', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile URL</label>
            <input type="url" value={resumeData.github} onChange={(e) => handleInputChange('github', '', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input type="text" value={resumeData.location} onChange={(e) => handleInputChange('location', '', e.target.value)} className="input-base" />
          </div>
        </div>
      ),
      isValid: !!resumeData.name && !!resumeData.email,
    },
    {
      id: 'objective',
      title: 'Career Objective',
      icon: <Target className="w-5 h-5" />,
      description: 'A brief statement about your career goals.',
      component: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Career Objective</label>
          <textarea value={resumeData.careerObjective} onChange={(e) => handleInputChange('careerObjective', '', e.target.value)} className="input-base h-24" />
        </div>
      ),
      isValid: !!resumeData.careerObjective,
    },
    {
      id: 'education',
      title: 'Education',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Your academic background and qualifications.',
      component: (
        <div className="space-y-4">
          {resumeData.education.map((edu: any, index: number) => (
            <div key={index} className="border p-4 rounded-lg space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                <input type="text" value={edu.degree} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">School/University</label>
                <input type="text" value={edu.school} onChange={(e) => handleArrayChange('education', index, 'school', e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input type="text" value={edu.year} onChange={(e) => handleArrayChange('education', index, 'year', e.target.value)} className="input-base" />
              </div>
              <button onClick={() => removeArrayItem('education', index)} className="btn-secondary text-red-600">Remove Education</button>
            </div>
          ))}
          <button onClick={() => addArrayItem('education', { degree: '', school: '', year: '' })} className="btn-secondary flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add Education</span>
          </button>
        </div>
      ),
      isValid: resumeData.education.length > 0 && resumeData.education.every((edu: any) => edu.degree && edu.school && edu.year),
    },
    {
      id: 'experience',
      title: 'Work Experience',
      icon: <Briefcase className="w-5 h-5" />,
      description: 'Your professional work history and achievements.',
      component: (
        <div className="space-y-4">
          {resumeData.workExperience.map((exp: any, expIndex: number) => (
            <div key={expIndex} className="border p-4 rounded-lg space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input type="text" value={exp.role} onChange={(e) => handleArrayChange('workExperience', expIndex, 'role', e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input type="text" value={exp.company} onChange={(e) => handleArrayChange('workExperience', expIndex, 'company', e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input type="text" value={exp.year} onChange={(e) => handleArrayChange('workExperience', expIndex, 'year', e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bullet Points</label>
                {exp.bullets.map((bullet: string, bulletIndex: number) => (
                  <div key={bulletIndex} className="flex items-center space-x-2 mb-2">
                    <input type="text" value={bullet} onChange={(e) => {
                      const newBullets = [...exp.bullets];
                      newBullets[bulletIndex] = e.target.value;
                      handleArrayChange('workExperience', expIndex, 'bullets', newBullets);
                    }} className="input-base flex-grow" />
                    <button onClick={() => {
                      const newBullets = exp.bullets.filter((_: string, i: number) => i !== bulletIndex);
                      handleArrayChange('workExperience', expIndex, 'bullets', newBullets);
                    }} className="btn-secondary text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => {
                  const newBullets = [...exp.bullets, ''];
                  handleArrayChange('workExperience', expIndex, 'bullets', newBullets);
                }} className="btn-secondary flex items-center space-x-2">
                  <Plus className="w-4 h-4" /> <span>Add Bullet</span>
                </button>
              </div>
              <button onClick={() => removeArrayItem('workExperience', expIndex)} className="btn-secondary text-red-600">Remove Experience</button>
            </div>
          ))}
          <button onClick={() => addArrayItem('workExperience', { role: '', company: '', year: '', bullets: [''] })} className="btn-secondary flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add Work Experience</span>
          </button>
        </div>
      ),
      isValid: resumeData.workExperience.length > 0 && resumeData.workExperience.every((exp: any) => exp.role && exp.company && exp.year && exp.bullets.every((b: string) => b)),
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: <Code className="w-5 h-5" />,
      description: 'Showcase your personal or academic projects.',
      component: (
        <div className="space-y-4">
          {resumeData.projects.map((proj: any, projIndex: number) => (
            <div key={projIndex} className="border p-4 rounded-lg space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                <input type="text" value={proj.title} onChange={(e) => handleArrayChange('projects', projIndex, 'title', e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bullet Points</label>
                {proj.bullets.map((bullet: string, bulletIndex: number) => (
                  <div key={bulletIndex} className="flex items-center space-x-2 mb-2">
                    <input type="text" value={bullet} onChange={(e) => {
                      const newBullets = [...proj.bullets];
                      newBullets[bulletIndex] = e.target.value;
                      handleArrayChange('projects', projIndex, 'bullets', newBullets);
                    }} className="input-base flex-grow" />
                    <button onClick={() => {
                      const newBullets = proj.bullets.filter((_: string, i: number) => i !== bulletIndex);
                      handleArrayChange('projects', projIndex, 'bullets', newBullets);
                    }} className="btn-secondary text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => {
                  const newBullets = [...proj.bullets, ''];
                  handleArrayChange('projects', projIndex, 'bullets', newBullets);
                }} className="btn-secondary flex items-center space-x-2">
                  <Plus className="w-4 h-4" /> <span>Add Bullet</span>
                </button>
              </div>
              <button onClick={() => removeArrayItem('projects', projIndex)} className="btn-secondary text-red-600">Remove Project</button>
            </div>
          ))}
          <button onClick={() => addArrayItem('projects', { title: '', bullets: [''] })} className="btn-secondary flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add Project</span>
          </button>
        </div>
      ),
      isValid: resumeData.projects.length > 0 && resumeData.projects.every((proj: any) => proj.title && proj.bullets.every((b: string) => b)),
    },
    {
      id: 'skills',
      title: 'Skills',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'List your technical and soft skills.',
      component: (
        <div className="space-y-4">
          {resumeData.skills.map((skillCat: any, catIndex: number) => (
            <div key={catIndex} className="border p-4 rounded-lg space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input type="text" value={skillCat.category} onChange={(e) => handleArrayChange('skills', catIndex, 'category', e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
                <textarea value={skillCat.list.join(', ')} onChange={(e) => {
                  const newSkills = e.target.value.split(',').map((s: string) => s.trim());
                  handleArrayChange('skills', catIndex, 'list', newSkills);
                }} className="input-base h-24" />
              </div>
              <button onClick={() => removeArrayItem('skills', catIndex)} className="btn-secondary text-red-600">Remove Category</button>
            </div>
          ))}
          <button onClick={() => addArrayItem('skills', { category: '', list: [] })} className="btn-secondary flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add Skill Category</span>
          </button>
        </div>
      ),
      isValid: resumeData.skills.length > 0 && resumeData.skills.every((skillCat: any) => skillCat.category && skillCat.list.length > 0),
    },
    {
      id: 'certifications',
      title: 'Certifications',
      icon: <Award className="w-5 h-5" />,
      description: 'Any professional certifications you hold.',
      component: (
        <div className="space-y-4">
          {resumeData.certifications.map((cert: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <input type="text" value={cert} onChange={(e) => {
                const newCerts = [...resumeData.certifications];
                newCerts[index] = e.target.value;
                setResumeData((prev: any) => ({ ...prev, certifications: newCerts }));
              }} className="input-base flex-grow" />
              <button onClick={() => removeArrayItem('certifications', index)} className="btn-secondary text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => addArrayItem('certifications', '')} className="btn-secondary flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add Certification</span>
          </button>
        </div>
      ),
      isValid: true, // Optional section
    },
    {
      id: 'achievements',
      title: 'Achievements & Activities',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Awards, honors, and extra-curricular involvement.',
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Achievements (comma-separated)</label>
            <textarea value={resumeData.achievements.join(', ')} onChange={(e) => handleInputChange('achievements', '', e.target.value.split(',').map((s: string) => s.trim()))} className="input-base h-24" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Extra-curricular Activities (comma-separated)</label>
            <textarea value={resumeData.extraCurricularActivities.join(', ')} onChange={(e) => handleInputChange('extraCurricularActivities', '', e.target.value.split(',').map((s: string) => s.trim()))} className="input-base h-24" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages Known (comma-separated)</label>
            <textarea value={resumeData.languagesKnown.join(', ')} onChange={(e) => handleInputChange('languagesKnown', '', e.target.value.split(',').map((s: string) => s.trim()))} className="input-base h-24" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Personal Details</label>
            <textarea value={resumeData.personalDetails} onChange={(e) => handleInputChange('personalDetails', '', e.target.value)} className="input-base h-24" />
          </div>
        </div>
      ),
      isValid: true, // Optional section
    },
  ];

  const handleNext = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateResume();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentSectionData = sections[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-16 px-4 sm:px-0 dark:from-dark-50 dark:to-dark-200 transition-colors duration-300">
      <div className="w-90vh max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')} // Changed to use navigate
          className="mb-6 bg-gradient-to-r from-neon-cyan-500 to-neon-blue-500 text-white hover:from-neon-cyan-400 hover:to-neon-blue-400 active:from-neon-cyan-600 active:to-neon-blue-600 shadow-md hover:shadow-neon-cyan py-3 px-5 rounded-xl inline-flex items-center space-x-2 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:block">Back to Home</span>
        </button>

        {isAuthenticated && (
          <div className="relative text-center mb-8 z-10">
            <button
              onClick={() => setShowOptimizationDropdown(!showOptimizationDropdown)}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-200 font-semibold text-sm bg-gradient-to-r from-neon-purple-500 to-neon-blue-600 text-white shadow-md hover:shadow-neon-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-cyan-500 max-w-[300px] mx-auto justify-center dark:shadow-neon-purple"
            >
              <span>
                {userSubscription
                  ? `Guided Builds Left: ${userSubscription.guidedBuildsTotal - userSubscription.guidedBuildsUsed}`
                  : 'No Active Plan'}
              </span>
              {showOptimizationDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showOptimizationDropdown && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-72 bg-white rounded-xl shadow-xl border border-secondary-200 py-3 z-20 dark:bg-dark-100 dark:border-dark-300 dark:shadow-dark-xl">
                {userSubscription ? (
                  <div className="text-center px-4">
                    <p className="text-sm text-secondary-700 dark:text-gray-300 mb-3">
                      You have **{userSubscription.guidedBuildsTotal - userSubscription.guidedBuildsUsed}** guided builds remaining.
                    </p>
                    <button
                      onClick={() => { onShowSubscriptionPlans(); setShowOptimizationDropdown(false); }}
                      className="w-full btn-secondary py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-2 dark:hover:shadow-neon-cyan/20"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Upgrade Plan</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center px-4">
                    <p className="text-sm text-secondary-700 dark:text-gray-300 mb-3">
                      You currently do not have an active subscription plan.
                    </p>
                    <button
                      onClick={() => { onShowSubscriptionPlans(); setShowOptimizationDropdown(false); }}
                      className="w-full btn-primary py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-2"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Choose Your Plan</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-100 dark:border-dark-300 dark:shadow-dark-xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Guided Resume Builder</h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {sections.length}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              {sections.map((section, index) => (
                <React.Fragment key={section.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        index < currentStep
                          ? 'bg-green-500 text-white'
                          : index === currentStep
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        section.icon
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium text-center ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {section.title}
                    </span>
                  </div>
                  {index < sections.length - 1 && (
                    <div className={`flex-1 h-1 rounded-full mx-2 transition-all duration-300 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {currentStep < sections.length ? (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-100 dark:border-dark-300 dark:shadow-dark-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                {currentSectionData.icon}
                <span className="ml-2">{currentSectionData.title}</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{currentSectionData.description}</p>
              {currentSectionData.component}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-100 dark:border-dark-300 dark:shadow-dark-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Generated Resume Preview
              </h2>
              {isGenerating ? (
                <div className="text-center py-8">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Generating your resume...</p>
                </div>
              ) : (
                <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono dark:bg-dark-200 dark:text-gray-100">
                  {generatedResumeText}
                </pre>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-100 dark:border-dark-300 dark:shadow-dark-xl">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`btn-secondary flex items-center space-x-2 ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              {currentStep < sections.length ? (
                <button
                  onClick={handleNext}
                  disabled={!currentSectionData.isValid || isGenerating}
                  className={`btn-primary flex items-center space-x-2 ${!currentSectionData.isValid || isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>{currentStep === sections.length - 1 ? 'Generate Resume' : 'Next'}</span>
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(0)} // Reset to start
                  className="btn-primary flex items-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Start New Resume</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
