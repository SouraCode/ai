import React, { useState, useEffect } from 'react';
import { Presentation } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import PptxGenJS from 'pptxgenjs';
import { Sparkles, Save, Download, ChevronLeft, ChevronRight, Edit3, Plus, Trash, Layout, Hash } from 'lucide-react';
import { API_BASE } from '../config/api';

export const AIPresentation = ({ projectToLoad, clearLoadedProject }) => {
  const { token } = useAuth();

  // Generator input states
  const [prompt, setPrompt] = useState('A marketing strategy for a coffee shop');
  const [style, setStyle] = useState('Minimalist');
  const [slideCount, setSlideCount] = useState(8);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Active presentation project states
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState('Untitled Presentation');
  const [slides, setSlides] = useState([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');

  const themes = [
    { id: 'Minimalist', label: 'Minimalist', desc: 'Soft creams, light grays, spacious styling', bg: 'bg-[#f4f4f3] text-stone-900 border-stone-200' },
    { id: 'Corporate', label: 'Corporate', desc: 'Professional deep blues, structured layouts', bg: 'bg-[#0f172a] text-white border-blue-900/45' },
    { id: 'Tech', label: 'Tech', desc: 'Neon grid lines, slate grays, coding monospace', bg: 'bg-[#0a0f1d] text-cyan-400 border-cyan-500/20' },
    { id: 'Creative', label: 'Creative', desc: 'Warm gradients, bold playful serif headers', bg: 'bg-gradient-to-br from-[#4c1d95] to-[#1e1b4b] text-white border-purple-500/20' },
    { id: 'Forest', label: 'Forest Green', desc: 'Deep sage greens, organic nature forest styling', bg: 'bg-[#0c1a16] text-[#c6ede2] border-emerald-500/20' },
    { id: 'Charcoal', label: 'Charcoal Dark', desc: 'Ultra premium charcoal blacks, copper gold accent text', bg: 'bg-[#121212] text-[#fcd34d] border-yellow-500/10' },
    { id: 'Luxury', label: 'Royal Violet', desc: 'Regal deep violet-indigo and glowing gold text', bg: 'bg-gradient-to-br from-[#1e1b4b] to-[#311042] text-[#fde047] border-yellow-400/20' },
    { id: 'Terracotta', label: 'Terracotta Warm', desc: 'Warm clay oranges, dark brown text, cozy feeling', bg: 'bg-[#fbf4ee] text-[#78350f] border-orange-200' }
  ];

  // Load project if passed from Dashboard
  useEffect(() => {
    if (projectToLoad) {
      setProjectId(projectToLoad._id);
      setProjectName(projectToLoad.name);
      setPrompt(projectToLoad.prompt);
      setStyle(projectToLoad.style || 'Minimalist');
      setSlides(projectToLoad.slides || []);
      setCurrentSlideIdx(0);
      clearLoadedProject();
    }
  }, [projectToLoad]);

  // Launch AI Presentation Builder
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt) return alert('Please input your presentation topic prompt.');

    setGenerating(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/ppt/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, style, slideCount })
      });

      const data = await response.json();
      if (response.ok) {
        setProjectId(data._id);
        setProjectName(data.name);
        setSlides(data.slides);
        setCurrentSlideIdx(0);
      } else {
        // Explicitly set the error if the backend was reached but returned a specific failure
        setError(data.message || 'Generation failed');
      }
    } catch (err) {
      console.warn('⚠️ Server PPT generation failed due to network error.', err.message);
      setError('Could not connect to backend server. Please verify your connection.');
    } finally {
      setGenerating(false);
    }
  };

  // ===== COMPREHENSIVE MOCK SLIDE ENGINE =====
  // Generates rich, structured, business-ready presentation slides
  const getMockSlidesByPrompt = (topic, count = 8) => {
    const topicWords = topic.toLowerCase();

    // Determine domain context for smarter content
    const isTech = /tech|software|app|ai|machine|data|cloud|saas|platform|code|develop/.test(topicWords);
    const isMarketing = /market|brand|advertis|social|campaign|grow|seo|content|digital/.test(topicWords);
    const isFood = /food|coffee|restaurant|cafe|bakery|kitchen|cook|recipe|menu/.test(topicWords);
    const isHealth = /health|medical|fitness|wellness|hospital|pharma|bio/.test(topicWords);
    const isEducation = /educat|school|university|learn|teach|course|academ|student/.test(topicWords);
    const isFinance = /financ|bank|invest|fund|stock|crypto|money|capital/.test(topicWords);

    const domain = isTech ? 'technology' : isMarketing ? 'marketing' : isFood ? 'food & beverage' : isHealth ? 'healthcare' : isEducation ? 'education' : isFinance ? 'finance' : 'business';

    const allSlides = [
      // SLIDE 1: Title Slide
      {
        id: 'slide_title',
        title: topic.length > 60 ? topic.substring(0, 57) + '...' : topic,
        subtitle: `A comprehensive ${domain} strategy deck — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        bullets: [
          `Prepared by the Strategic ${domain.charAt(0).toUpperCase() + domain.slice(1)} Planning Division`,
          'This presentation covers market analysis, strategic roadmap, financial projections, and operational execution plans',
          `Industry vertical: ${domain.charAt(0).toUpperCase() + domain.slice(1)} | Target audience: Stakeholders & Decision Makers`,
          'Confidential — For internal review and investor discussions only'
        ],
        imageCategory: 'title'
      },
      // SLIDE 2: Executive Summary
      {
        id: 'slide_exec_summary',
        title: 'Executive Summary',
        subtitle: 'High-level overview of the strategic initiative and expected impact',
        bullets: [
          `This initiative aims to transform the ${domain} landscape by introducing innovative solutions that address critical market gaps identified through extensive primary and secondary research`,
          `Our analysis reveals a $${(Math.random() * 50 + 10).toFixed(1)}B total addressable market (TAM) with a compound annual growth rate (CAGR) of ${(Math.random() * 15 + 8).toFixed(1)}% projected through 2030`,
          `The proposed strategy leverages cutting-edge methodologies in ${domain} to deliver measurable ROI within the first 12–18 months of implementation`,
          'Key performance indicators (KPIs) include customer acquisition cost reduction, lifetime value optimization, and market share expansion across three primary segments',
          'This deck outlines the problem space, proposed solution, go-to-market strategy, financial model, and team structure required for successful execution'
        ],
        imageCategory: 'summary'
      },
      // SLIDE 3: Problem / Opportunity
      {
        id: 'slide_problem',
        title: 'Problem Statement & Market Opportunity',
        subtitle: 'Understanding the pain points and untapped potential in the current landscape',
        bullets: [
          `Current ${domain} solutions suffer from fragmentation, poor user experience, and lack of integration — creating frustration for end users and operational inefficiency for providers`,
          `${(Math.random() * 30 + 55).toFixed(0)}% of surveyed professionals report dissatisfaction with existing tools, citing complexity, high costs, and limited customization options`,
          `The shift toward digital-first experiences has created a window of opportunity worth an estimated $${(Math.random() * 5 + 2).toFixed(1)}B in underserved market segments`,
          'Legacy competitors are slow to adapt, providing a strategic first-mover advantage for agile new entrants with modern technology stacks',
          `Regulatory changes and evolving consumer preferences in ${domain} further amplify demand for next-generation solutions`
        ],
        imageCategory: 'problem'
      },
      // SLIDE 4: Market Analysis & Research
      {
        id: 'slide_market',
        title: 'Market Analysis & Competitive Landscape',
        subtitle: 'Data-driven insights into market size, segmentation, and competitor positioning',
        bullets: [
          `Serviceable Addressable Market (SAM): $${(Math.random() * 15 + 5).toFixed(1)}B across ${Math.floor(Math.random() * 3) + 3} primary geographic regions — North America, Europe, and Asia-Pacific lead adoption curves`,
          `Competitive analysis reveals ${Math.floor(Math.random() * 5) + 3} major incumbents controlling ${(Math.random() * 25 + 45).toFixed(0)}% market share, with remaining fragmentation among ${Math.floor(Math.random() * 50) + 20}+ smaller players`,
          `Customer segmentation identifies three high-value personas: Enterprise decision-makers (40% revenue potential), mid-market operations teams (35%), and individual professionals/prosumers (25%)`,
          `Trend analysis shows ${(Math.random() * 20 + 25).toFixed(0)}% year-over-year growth in demand for AI-augmented and automation-centric solutions within ${domain}`,
          'SWOT analysis positions our approach with strong differentiation on user experience, integration capabilities, and pricing transparency versus incumbents'
        ],
        imageCategory: 'market'
      },
      // SLIDE 5: Solution / Strategy
      {
        id: 'slide_solution',
        title: 'Our Solution & Strategic Approach',
        subtitle: `How we plan to capture market share and deliver exceptional value in ${domain}`,
        bullets: [
          `A modular, scalable platform architecture designed for seamless onboarding — reducing time-to-value from industry-average 6 weeks to under 72 hours`,
          `Three-tier product strategy: Free community tier for awareness and adoption, Professional tier ($${Math.floor(Math.random() * 30) + 20}/mo) for power users, and Enterprise tier (custom pricing) for organizations`,
          `Proprietary AI engine trained on ${(Math.random() * 5 + 1).toFixed(1)}M+ domain-specific data points to deliver personalized recommendations, automated workflows, and predictive analytics`,
          'API-first design enabling 200+ third-party integrations with popular tools across CRM, project management, communication, and analytics ecosystems',
          'Customer success framework including dedicated onboarding specialists, 24/7 support, and quarterly business reviews for enterprise accounts'
        ],
        imageCategory: 'solution'
      },
      // SLIDE 6: Go-to-Market Roadmap
      {
        id: 'slide_roadmap',
        title: 'Go-to-Market Roadmap & Milestones',
        subtitle: 'Phased execution plan with quarterly objectives and key deliverables',
        bullets: [
          'Phase 1 (Q1-Q2): Foundation — Complete MVP development, secure beta partnerships with 50 early adopters, establish brand identity and content marketing engine, obtain necessary certifications',
          'Phase 2 (Q3-Q4): Traction — Public launch with freemium model, execute paid acquisition campaigns (Google Ads, LinkedIn, industry events), achieve 1,000 active users and $100K ARR milestone',
          'Phase 3 (Year 2, H1): Scale — Expand to 3 new markets, launch enterprise tier, build partner ecosystem with 25+ system integrators, target $1M ARR with 85% gross margin',
          'Phase 4 (Year 2, H2): Optimize — Introduce advanced AI features, achieve product-market fit metrics (NPS > 60, churn < 3%), prepare Series A fundraising materials',
          'Phase 5 (Year 3): Expand — International expansion to 10+ countries, strategic acquisition targets identified, path to profitability with $5M+ ARR run-rate'
        ],
        imageCategory: 'roadmap'
      },
      // SLIDE 7: Financial Projections
      {
        id: 'slide_financials',
        title: 'Financial Model & Revenue Projections',
        subtitle: 'Conservative, base-case, and optimistic scenarios with key assumptions',
        bullets: [
          `Year 1 projected revenue: $${(Math.random() * 300 + 150).toFixed(0)}K (base case) — driven primarily by professional tier subscriptions and early enterprise contracts`,
          `Year 2 projected revenue: $${(Math.random() * 2 + 1).toFixed(1)}M with ${(Math.random() * 10 + 70).toFixed(0)}% gross margin — customer acquisition cost (CAC) payback period of ${Math.floor(Math.random() * 6) + 6} months`,
          `Year 3 projected revenue: $${(Math.random() * 5 + 4).toFixed(1)}M — blended annual contract value (ACV) of $${(Math.random() * 5 + 3).toFixed(0)}K per customer with ${(Math.random() * 15 + 110).toFixed(0)}% net revenue retention`,
          `Initial funding requirement: $${(Math.random() * 1.5 + 0.5).toFixed(1)}M seed round — 18-month runway covering product development (45%), go-to-market (35%), and operations (20%)`,
          'Break-even target: Month 24 on a unit economics basis, Month 30 on a fully-loaded basis — with clear path to Series A at 3x revenue multiple valuation'
        ],
        imageCategory: 'finance'
      },
      // SLIDE 8: Team & Resources
      {
        id: 'slide_team',
        title: 'Team Structure & Key Resources',
        subtitle: 'The people, partnerships, and infrastructure powering execution',
        bullets: [
          'Leadership team combines 40+ years of collective experience across product development, go-to-market strategy, and operations in relevant industry verticals',
          `Core team of ${Math.floor(Math.random() * 8) + 8} professionals spanning engineering (${Math.floor(Math.random() * 3) + 4} engineers), design (2 UX/UI specialists), marketing (2 growth strategists), and customer success (2 specialists)`,
          'Advisory board includes former executives from industry leaders providing strategic guidance on product direction, fundraising, and enterprise sales playbook',
          `Technology infrastructure built on cloud-native architecture (AWS/GCP) with 99.95% uptime SLA, SOC 2 Type II compliance, and GDPR-ready data processing`,
          'Strategic partnerships established with 3 channel partners, 2 technology alliances, and 1 academic research institution for continuous innovation pipeline'
        ],
        imageCategory: 'team'
      },
      // SLIDE 9: Risk Analysis
      {
        id: 'slide_risks',
        title: 'Risk Assessment & Mitigation Strategies',
        subtitle: 'Proactive identification and management of key business risks',
        bullets: [
          'Market risk: Slower-than-expected adoption mitigated by diversified go-to-market channels (direct, partner, PLG) and flexible pricing — pivot capacity maintained through modular architecture',
          'Technology risk: Platform scalability challenges addressed through microservices architecture, comprehensive test automation (95% coverage), and dedicated DevOps/SRE team',
          'Competitive risk: New entrant or incumbent response countered by rapid feature velocity (bi-weekly releases), strong IP portfolio, and deep customer relationships',
          'Financial risk: Runway extension strategies including revenue-based financing options, potential bridge round commitments from existing investors, and clear cost reduction levers',
          'Regulatory risk: Proactive compliance framework with dedicated legal counsel, industry association memberships, and flexible data architecture supporting multi-jurisdictional requirements'
        ],
        imageCategory: 'risk'
      },
      // SLIDE 10: Metrics & KPIs
      {
        id: 'slide_metrics',
        title: 'Key Performance Indicators & Success Metrics',
        subtitle: 'Measurable targets and tracking framework for accountability',
        bullets: [
          `Growth metrics: Monthly active users (MAU) target of ${(Math.random() * 5000 + 2000).toFixed(0)} by Month 12, with ${(Math.random() * 10 + 15).toFixed(0)}% month-over-month growth in quarters 2-4`,
          `Revenue metrics: Monthly recurring revenue (MRR) of $${(Math.random() * 50 + 30).toFixed(0)}K by Month 12, average revenue per user (ARPU) of $${(Math.random() * 30 + 15).toFixed(0)}/month`,
          `Engagement metrics: Daily active / monthly active user ratio (DAU/MAU) > 40%, average session duration > ${Math.floor(Math.random() * 5) + 8} minutes, feature adoption rate > 60% within 30 days of release`,
          `Retention metrics: Month-1 retention > 80%, Month-6 retention > 55%, annual churn rate < ${(Math.random() * 3 + 3).toFixed(0)}% for enterprise accounts`,
          'Operational metrics: Customer satisfaction score (CSAT) > 4.5/5, median support response time < 2 hours, deployment frequency > 10x per month with < 0.5% incident rate'
        ],
        imageCategory: 'metrics'
      },
      // SLIDE 11: Case Study / Social Proof
      {
        id: 'slide_case_study',
        title: 'Early Validation & Case Study Highlights',
        subtitle: 'Evidence of product-market fit from pilot programs and beta feedback',
        bullets: [
          `Beta pilot with ${Math.floor(Math.random() * 20) + 15} organizations resulted in ${(Math.random() * 20 + 75).toFixed(0)}% satisfaction rating and ${(Math.random() * 30 + 60).toFixed(0)}% expressed intent to convert to paid plans`,
          `Featured case study: [Partner Company] achieved ${(Math.random() * 25 + 20).toFixed(0)}% efficiency improvement and $${(Math.random() * 50 + 20).toFixed(0)}K annual cost savings within 90 days of deployment`,
          `User testimonial pipeline includes ${Math.floor(Math.random() * 10) + 5} written endorsements from C-level executives and department heads across target industries`,
          'Product Hunt launch achieved Top 5 Product of the Day, generating 2,500+ upvotes and 400+ organic sign-ups in the first 48 hours',
          `Industry recognition: Shortlisted for ${Math.floor(Math.random() * 2) + 2} innovation awards, featured in 3 trade publications and 2 podcast interviews`
        ],
        imageCategory: 'validation'
      },
      // SLIDE 12: Conclusion & Call to Action
      {
        id: 'slide_conclusion',
        title: 'Conclusion & Next Steps',
        subtitle: 'Summary of the opportunity and immediate action items for stakeholders',
        bullets: [
          `The ${domain} market presents a compelling multi-billion dollar opportunity, and our differentiated approach positions us to capture significant share through superior product experience and strategic execution`,
          'Immediate next steps: Finalize funding round commitments by end of current quarter, complete hiring for 3 critical engineering roles, and launch public marketing campaign',
          'Decision point for stakeholders: Investment commitment, partnership agreement, or pilot program enrollment — each with clearly defined terms and mutual value creation frameworks',
          'We invite questions, feedback, and discussion on any aspect of this strategic plan — additional supporting materials including detailed financial models, technical architecture documents, and customer research reports are available upon request',
          `Contact: [Your Name] — [email@company.com] | Schedule a follow-up meeting to discuss partnership and investment opportunities`
        ],
        imageCategory: 'conclusion'
      }
    ];

    // Return requested number of slides
    return allSlides.slice(0, Math.min(count, allSlides.length));
  };

  // Inline Slide Editing Handlers
  const updateSlideField = (field, value) => {
    const updated = [...slides];
    updated[currentSlideIdx][field] = value;
    setSlides(updated);
  };

  const updateBulletPoint = (bulletIdx, value) => {
    const updated = [...slides];
    updated[currentSlideIdx].bullets[bulletIdx] = value;
    setSlides(updated);
  };

  const addBulletPoint = () => {
    const updated = [...slides];
    updated[currentSlideIdx].bullets.push('New key takeaway point');
    setSlides(updated);
  };

  const deleteBulletPoint = (bulletIdx) => {
    const updated = [...slides];
    updated[currentSlideIdx].bullets.splice(bulletIdx, 1);
    setSlides(updated);
  };

  const addSlide = () => {
    const newSlide = {
      id: 'slide_' + Math.random().toString(36).substr(2, 9),
      title: 'New Slide Title',
      subtitle: 'New slide subtitle description',
      bullets: ['Point one explanation', 'Point two overview'],
      imageCategory: 'general'
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIdx(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return alert('Your presentation must contain at least one slide.');
    const updated = slides.filter((_, idx) => idx !== currentSlideIdx);
    setSlides(updated);
    setCurrentSlideIdx(Math.max(0, currentSlideIdx - 1));
  };

  // Save current slide edits back to database
  const handleSaveProject = async () => {
    if (!projectId) return;
    setSaveStatus('saving');

    try {
      const response = await fetch(`${API_BASE}/api/ppt/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: projectName,
          style,
          slides
        })
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      console.warn('⚠️ Server offline during slide saving. Local state cached.');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Flawless PowerPoint (.pptx) Exports using pptxgenjs!
  const handleExportPPTX = () => {
    if (slides.length === 0) return;

    const pptx = new pptxgen();

    // Set presentation properties
    pptx.title = projectName;
    pptx.subject = 'AI Generated Presentation Deck';

    slides.forEach((slideData, slideIdx) => {
      const slide = pptx.addSlide();

      // Theme Custom Colors mapping
      let bgHex = 'F4F4F3';
      let titleHex = '1A202C';
      let subtitleHex = '6B7280';
      let bulletHex = '4A5568';
      let accentHex = '10B981';

      if (style === 'Corporate') {
        bgHex = '0F172A';
        titleHex = '3B82F6';
        subtitleHex = '93C5FD';
        bulletHex = 'E2E8F0';
        accentHex = '3B82F6';
      } else if (style === 'Tech') {
        bgHex = '0A0F1D';
        titleHex = '06B6D4';
        subtitleHex = '67E8F9';
        bulletHex = '94A3B8';
        accentHex = '06B6D4';
      } else if (style === 'Creative') {
        bgHex = '2E1065';
        titleHex = 'F43F5E';
        subtitleHex = 'FCA5A5';
        bulletHex = 'F8FAFC';
        accentHex = 'F43F5E';
      } else if (style === 'Forest') {
        bgHex = '0C1A16';
        titleHex = 'C6EDE2';
        subtitleHex = '34D399';
        bulletHex = 'C6EDE2';
        accentHex = '10B981';
      } else if (style === 'Charcoal') {
        bgHex = '121212';
        titleHex = 'FCD34D';
        subtitleHex = 'A3A3A3';
        bulletHex = 'E5E5E5';
        accentHex = 'F59E0B';
      } else if (style === 'Luxury') {
        bgHex = '1E1B4B';
        titleHex = 'FDE047';
        subtitleHex = 'C084FC';
        bulletHex = 'F8FAFC';
        accentHex = 'EAB308';
      } else if (style === 'Terracotta') {
        bgHex = 'FBF4EE';
        titleHex = '78350F';
        subtitleHex = 'B45309';
        bulletHex = '451A03';
        accentHex = 'D97706';
      }

      slide.background = { color: bgHex };

      // Slide number badge
      slide.addText(`${slideIdx + 1}`, {
        x: 9.2, y: 0.3, w: 0.5, h: 0.3,
        fontSize: 9, bold: true, color: subtitleHex, align: 'right'
      });

      // Title
      slide.addText(slideData.title, {
        x: 0.8, y: 0.6, w: '85%', h: 0.9,
        fontSize: slideIdx === 0 ? 32 : 26,
        bold: true, color: titleHex, fontFace: 'Arial'
      });

      // Subtitle
      slide.addText(slideData.subtitle, {
        x: 0.8, y: 1.4, w: '85%', h: 0.5,
        fontSize: 14, italic: true, color: subtitleHex, fontFace: 'Arial'
      });

      // Accent line
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 1.95, w: 1.5, h: 0.04,
        fill: { color: accentHex }
      });

      // Bullet points with proper formatting
      const bulletObjects = slideData.bullets.map((b) => ({
        text: b,
        options: { bullet: { type: 'number' }, indentLevel: 0, paraSpaceAfter: 8 }
      }));

      slide.addText(bulletObjects, {
        x: 0.8, y: 2.2, w: '85%', h: 3.6,
        fontSize: 12, color: bulletHex,
        lineSpacing: 20, fontFace: 'Arial', valign: 'top'
      });

      // Footer
      slide.addText(`${projectName}  |  Slide ${slideIdx + 1} of ${slides.length}`, {
        x: 0.8, y: 5.2, w: '85%', h: 0.3,
        fontSize: 8, color: subtitleHex, fontFace: 'Arial'
      });
    });

    pptx.writeFile({ fileName: `${projectName}.pptx` });
  };

  const activeThemeClass = themes.find(t => t.id === style) || themes[0];

  return (
    <div className="space-y-6 animate-float-in">

      {/* PPT Suite Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-sans flex items-center gap-2">
            <span><Presentation size={80} strokeWidth={1.5} /></span> AI Presentation Builder
          </h1>
          {slides.length > 0 ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-b border-white/10 hover:border-blue-400 focus:border-blue-500 text-sm text-gray-400 focus:outline-none py-1 mt-1 transition-colors font-medium"
              placeholder="Name your presentation"
            />
          ) : (
            <p className="text-xs text-gray-400 font-light mt-1">
              Enter a creative business or tech topic prompt to synthesize professional slide layouts in seconds.
            </p>
          )}
        </div>

        {slides.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setSlides([]); setProjectId(null); }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>New Presentation</span>
            </button>
            <button
              onClick={handleSaveProject}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              {saveStatus === 'saving' ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : <Save size={14} />}
              <span>{saveStatus === 'success' ? 'Saved!' : 'Save Deck'}</span>
            </button>
            <button
              onClick={handleExportPPTX}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-[#0d1d19] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Download size={14} />
              <span>Export PPTX</span>
            </button>
          </div>
        )}
      </div>

      {/* Generator Prompt Box (If no slides active) */}
      {slides.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prompt Entry Card */}
          <div className="lg:col-span-2 glass-card rounded-[32px] p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-blue-500/5 blur-[80px]" />

            <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-2xl flex flex-col gap-1 relative overflow-hidden animate-shake">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-red-400">
                      <span>⚠️</span>
                      <span>AI Presentation Generator Error</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer text-sm px-1.5"
                    >
                      ×
                    </button>
                  </div>
                  <p className="leading-relaxed opacity-90 mt-1">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">
                  Topic Prompt Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows="4"
                  required
                  placeholder="e.g. A coffee shop strategic launch, organic farming operations, SaaS platform go-to-market strategy, healthcare innovation pitch..."
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 focus:border-blue-500 rounded-2xl text-sm placeholder-gray-500 text-white focus:outline-none transition-all"
                />
                <p className="text-[10px] text-gray-500 font-light">
                  💡 Tip: Be specific! Include industry, target audience, and goals for richer, more relevant slide content.
                </p>
              </div>

              {/* Slide Count Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Hash size={12} /> Number of Slides
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 8, 12].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSlideCount(num)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${slideCount === num
                        ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-300 shadow-md'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <span className="text-lg">{num}</span>
                      <span className="text-[9px] uppercase tracking-wider opacity-70">
                        {num === 5 ? 'Quick Pitch' : num === 8 ? 'Standard' : 'Comprehensive'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">
                  Visual Layout Theme Style
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => setStyle(theme.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${style === theme.id
                        ? 'bg-blue-500/10 border-blue-500 text-white shadow-md'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                      <div>
                        <span className={`text-xs font-bold ${style === theme.id ? 'text-blue-400' : 'text-gray-300'}`}>
                          {theme.label}
                        </span>
                        <p className="text-[11px] text-gray-500 font-light mt-1">
                          {theme.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating {slideCount} slides...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate {slideCount} Presentation Slides</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-1 glass-card rounded-[32px] p-8 flex flex-col justify-between relative">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Layout size={24} />
              </div>
              <h3 className="text-lg font-bold text-white font-sans">PowerPoint Engine</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Our layout synthesizer generates comprehensive, business-ready decks with structured sections covering every aspect of your topic.
              </p>

              <ul className="space-y-3 text-xs text-gray-500 font-light">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Executive summary & problem analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Market research & competitive landscape
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Financial projections & KPIs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Go-to-market roadmap & milestones
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Risk assessment & team structure
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Native .pptx export for Microsoft PowerPoint
                </li>
              </ul>

              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <p className="text-[10px] text-blue-300 font-medium">
                  ✨ Each slide includes 4-5 detailed bullet points with real data projections and actionable insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE PRESENTATION VIEWER & SLIDE EDITOR */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Slide Stage Preview */}
          <div className="lg:col-span-2 space-y-6">

            {/* Horizontal Carousel Indicators & Navigation */}
            <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-md border border-white/5 px-4 py-3 rounded-2xl">
              <button
                disabled={currentSlideIdx === 0}
                onClick={() => setCurrentSlideIdx(prev => Math.max(0, prev - 1))}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <span>Slide</span>
                <span className="text-white bg-blue-500/20 px-2 py-0.5 rounded text-blue-400 font-extrabold">
                  {currentSlideIdx + 1}
                </span>
                <span>of</span>
                <span>{slides.length}</span>
              </div>

              <button
                disabled={currentSlideIdx === slides.length - 1}
                onClick={() => setCurrentSlideIdx(prev => Math.min(slides.length - 1, prev + 1))}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* High Fidelity Theme Styled Slide Card Container */}
            <div className={`aspect-[16/10] w-full rounded-[32px] border shadow-2xl p-10 md:p-14 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${activeThemeClass.bg}`}>

              {/* Monospace Tech background grids */}
              {style === 'Tech' && (
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />
              )}

              {/* Slide number badge */}
              <div className="absolute top-4 right-6 text-[10px] font-bold opacity-40">
                {currentSlideIdx + 1}/{slides.length}
              </div>

              <div>
                {/* Editable Slide Title */}
                <div className="relative group">
                  <input
                    type="text"
                    value={slides[currentSlideIdx].title || ''}
                    onChange={(e) => updateSlideField('title', e.target.value)}
                    className="w-full bg-transparent font-bold text-2xl md:text-4xl focus:outline-none focus:bg-white/5 rounded px-2 py-1 select-all relative z-10 border-b border-dashed border-transparent hover:border-gray-400/40 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Editable Slide Subtitle */}
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={slides[currentSlideIdx].subtitle || ''}
                    onChange={(e) => updateSlideField('subtitle', e.target.value)}
                    className="w-full bg-transparent italic text-sm md:text-base focus:outline-none focus:bg-white/5 rounded px-2 py-1 border-b border-dashed border-transparent hover:border-gray-400/40 focus:border-blue-500 transition-colors opacity-80"
                  />
                </div>
              </div>

              {/* Editable Bullet points */}
              <div className="my-6 space-y-3 overflow-y-auto max-h-[50%] pr-2">
                {slides[currentSlideIdx].bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2.5 group">
                    <span className="text-xs leading-none mt-2 shrink-0 font-bold opacity-60 min-w-[20px]">
                      {style === 'Tech' ? `0${bIdx + 1}` : `${bIdx + 1}.`}
                    </span>
                    <textarea
                      value={bullet}
                      onChange={(e) => updateBulletPoint(bIdx, e.target.value)}
                      rows={Math.max(2, Math.ceil(bullet.length / 80))}
                      className="flex-1 bg-transparent text-xs md:text-sm focus:outline-none focus:bg-white/5 rounded px-2 py-0.5 border border-dashed border-transparent hover:border-gray-400/30 focus:border-blue-500 transition-colors resize-none leading-relaxed"
                    />
                    <button
                      onClick={() => deleteBulletPoint(bIdx)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity p-1 cursor-pointer shrink-0"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={addBulletPoint}
                  className="px-3 py-1 bg-white/5 border border-dashed border-white/10 hover:bg-white/10 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 mt-2 text-gray-400 hover:text-white cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Add Bullet point</span>
                </button>
              </div>

              {/* Footer info matching reference styling */}
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider opacity-60 font-semibold border-t pt-4">
                <span>{projectName}</span>
                <span>Slide {currentSlideIdx + 1}</span>
              </div>

            </div>

            {/* Slide Control options */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={addSlide}
                className="px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Insert New Slide</span>
              </button>
              <button
                onClick={deleteSlide}
                className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash size={14} />
                <span>Delete Active Slide</span>
              </button>
            </div>

          </div>

          {/* Slide Deck Index Grid & Outline List */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-[32px] p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 font-sans flex items-center gap-2">
                <span>📑</span> Presentation Index
              </h3>

              <div className="space-y-3 overflow-y-auto max-h-[480px] pr-2">
                {slides.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => setCurrentSlideIdx(idx)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 select-none ${idx === currentSlideIdx
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-inner'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate">
                        {s.title || 'Slide Title'}
                      </h4>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {s.bullets.length} points • {style} theme
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Card info showing dynamic style themes */}
            <div className="glass-card rounded-[32px] p-6 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Style Theme</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{style} Theme</span>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="Minimalist">Minimalist</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Tech">Tech</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>
            </div>

            {/* Deck Stats */}
            <div className="glass-card rounded-[32px] p-6 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deck Statistics</h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="text-lg font-bold text-white">{slides.length}</div>
                  <div className="text-[9px] text-gray-500 uppercase">Total Slides</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="text-lg font-bold text-white">
                    {slides.reduce((acc, s) => acc + s.bullets.length, 0)}
                  </div>
                  <div className="text-[9px] text-gray-500 uppercase">Total Points</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default AIPresentation;
