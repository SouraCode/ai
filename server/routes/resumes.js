import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { ResumeStore } from '../models/ResumeProject.js';

const router = express.Router();

// Default starter resume data to prepopulate a new builder instantly!
const getStarterResume = (userId, name = 'My First Resume') => ({
  userId,
  name,
  templateId: 'modern',
  personalInfo: {
    fullName: 'Jane Doe',
    title: 'Senior Software Engineer',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    website: 'https://janedoe.dev',
    summary: 'Innovative and performance-driven Software Engineer with 5+ years of experience designing scalable web solutions. Passionate about green tech, clean styling architectures, and full-stack performance optimizations.'
  },
  experience: [
    {
      id: 'exp_1',
      company: 'EcoSystems Inc.',
      role: 'Lead Full-Stack Developer',
      startDate: '2023-01',
      endDate: 'Present',
      description: 'Architected real-time environmental monitoring dashboard using MERN stack, reducing page load latency by 35%. Coached junior engineers on UI styling standards and clean API patterns.'
    },
    {
      id: 'exp_2',
      company: 'DevCraft Labs',
      role: 'Software Engineer II',
      startDate: '2021-03',
      endDate: '2022-12',
      description: 'Collaborated on standardizing reusable design frameworks, accelerating feature releases across 4 product suites by 20%. Integrated payment processing portals securely.'
    }
  ],
  education: [
    {
      id: 'edu_1',
      school: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      startDate: '2016-09',
      endDate: '2020-05',
      description: 'Graduated with Honors. Specialized in software design frameworks and database scalability.'
    }
  ],
  skills: [
    'JavaScript (ES6+)', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'System Architecture', 'Git & CI/CD'
  ],
  projects: [
    {
      id: 'proj_1',
      name: 'Forest Dashboard UI',
      technologies: 'React, Tailwind CSS, Canvas API',
      description: 'Built a beautiful glassmorphic visual system mimicking nature themes, optimizing vector loading times and supporting instant user theme configurations.',
      link: 'https://github.com/janedoe/forest-ui'
    }
  ],
  certifications: [
    {
      id: 'cert_1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2024-08',
      link: 'https://aws.amazon.com'
    }
  ],
  languages: [
    { id: 'lang_1', name: 'English', level: 'Native / Bilingual' },
    { id: 'lang_2', name: 'Spanish', level: 'Professional Working' }
  ],
  volunteerWork: [
    {
      id: 'vol_1',
      organization: 'Code for America',
      role: 'Volunteer Full-Stack Developer',
      startDate: '2022-01',
      endDate: '2022-12',
      description: 'Built a local food-bank locator web app using React and Node.js, helping over 5,000 community members access local resources.'
    }
  ],
  awards: [
    {
      id: 'aw_1',
      title: 'Outstanding Engineering Excellence',
      issuer: 'EcoSystems Inc.',
      date: '2024-11',
      description: 'Awarded for leading the migration of the core platform to modern serverless containers, saving 40% in monthly cloud costs.'
    }
  ],
  hobbies: [
    'Hiking', 'Landscape Photography', 'Contributing to Open Source', 'Urban Gardening'
  ],
  publications: [
    {
      id: 'pub_1',
      title: 'Optimizing Virtual DOM Updates in Heavy Data Visualizations',
      publisher: 'JS Journal of Engineering',
      date: '2023-05',
      description: 'Co-authored a paper analyzing virtual DOM diff algorithms and strategies to minimize reflows in interactive UI dashboards.',
      link: 'https://jsjournal.org/optimizing-vdom'
    }
  ],
  references: [
    {
      id: 'ref_1',
      name: 'Dr. Sarah Connor',
      role: 'VP of Engineering',
      company: 'EcoSystems Inc.',
      contact: 'sarah.connor@ecosystems.com | +1 (555) 012-3456'
    }
  ]
});

// @route   POST api/resumes
// @desc    Create a new resume project (optionally with starter contents)
router.post('/', authMiddleware, async (req, res) => {
  const { 
    name, 
    templateId, 
    personalInfo, 
    experience, 
    education, 
    skills, 
    projects,
    certifications,
    languages,
    volunteerWork,
    awards,
    hobbies,
    publications,
    references
  } = req.body;
  
  try {
    const resumeName = name || 'My Resume';
    
    // If request contains data, save it. Otherwise, use starter data.
    const projectData = req.body.personalInfo ? {
      userId: req.user.id,
      name: resumeName,
      templateId: templateId || 'modern',
      personalInfo,
      experience: experience || [],
      education: education || [],
      skills: skills || [],
      projects: projects || [],
      certifications: certifications || [],
      languages: languages || [],
      volunteerWork: volunteerWork || [],
      awards: awards || [],
      hobbies: hobbies || [],
      publications: publications || [],
      references: references || []
    } : getStarterResume(req.user.id, resumeName);

    const project = await ResumeStore.create(projectData);
    res.status(201).json(project);
  } catch (error) {
    console.error('Create resume project error:', error);
    res.status(500).json({ message: 'Server error creating resume project' });
  }
});

// @route   GET api/resumes
// @desc    Get all resume projects for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await ResumeStore.findByUser(req.user.id);
    res.json(projects);
  } catch (error) {
    console.error('Fetch resumes error:', error);
    res.status(500).json({ message: 'Server error retrieving resumes' });
  }
});

// @route   PUT api/resumes/:id
// @desc    Update a resume project
router.put('/:id', authMiddleware, async (req, res) => {
  const { 
    name, 
    templateId, 
    personalInfo, 
    experience, 
    education, 
    skills, 
    projects,
    certifications,
    languages,
    volunteerWork,
    awards,
    hobbies,
    publications,
    references
  } = req.body;

  try {
    let project = await ResumeStore.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Resume project not found' });
    }

    if (project.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this resume' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (templateId) updateData.templateId = templateId;
    if (personalInfo) updateData.personalInfo = personalInfo;
    if (experience) updateData.experience = experience;
    if (education) updateData.education = education;
    if (skills) updateData.skills = skills;
    if (projects) updateData.projects = projects;
    if (certifications) updateData.certifications = certifications;
    if (languages) updateData.languages = languages;
    if (volunteerWork) updateData.volunteerWork = volunteerWork;
    if (awards) updateData.awards = awards;
    if (hobbies) updateData.hobbies = hobbies;
    if (publications) updateData.publications = publications;
    if (references) updateData.references = references;

    const updated = await ResumeStore.update(req.params.id, updateData);
    res.json(updated);
  } catch (error) {
    console.error('Update resume project error:', error);
    res.status(500).json({ message: 'Server error saving resume updates' });
  }
});

// @route   DELETE api/resumes/:id
// @desc    Delete a resume project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await ResumeStore.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Resume project not found' });
    }

    if (project.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this resume' });
    }

    await ResumeStore.delete(req.params.id);
    res.json({ message: 'Resume successfully deleted' });
  } catch (error) {
    console.error('Delete resume project error:', error);
    res.status(500).json({ message: 'Server error deleting resume' });
  }
});

export default router;
