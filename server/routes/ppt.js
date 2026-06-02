import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { PPTStore } from '../models/PPTProject.js';

const router = express.Router();

// Helper to simulate an AI generation engine that maps prompt keywords to highly relevant slide layouts
const generateMockSlides = (prompt, style) => {
  const p = prompt.toLowerCase();
  
  // Design some industry-specific templates
  if (p.includes('coffee') || p.includes('cafe') || p.includes('restaurant') || p.includes('food')) {
    return [
      {
        id: 'slide_1',
        title: 'Crafting the Ultimate Experience',
        subtitle: `A Strategic Presentation for: "${prompt}"`,
        bullets: [
          'Defining our unique brew profiles and ambiance',
          'Targeting local coffee enthusiasts and remote workers',
          'Creating a hub for community engagement and art display'
        ],
        imageCategory: 'coffee'
      },
      {
        id: 'slide_2',
        title: 'Market Analysis & Brand Positioning',
        subtitle: 'Standing out in a competitive cafe landscape',
        bullets: [
          'Identifying premium specialty coffee beans sourcing channels',
          'Establishing a cozy, warm, and hyper-wired aesthetic',
          'Competitive analysis of local cafes vs. major global chains'
        ],
        imageCategory: 'cafe'
      },
      {
        id: 'slide_3',
        title: 'Marketing & Digital Outreach',
        subtitle: 'Driving footprints and loyalty program signups',
        bullets: [
          'Social media campaigns featuring craft brewing techniques',
          'Subscription-based morning coffee packages for neighborhood regulars',
          'Collaborations with local bakeries and artisanal food producers'
        ],
        imageCategory: 'pastry'
      },
      {
        id: 'slide_4',
        title: 'Financial Projections & Roadmap',
        subtitle: 'Scalable expansion and healthy store margins',
        bullets: [
          'Phase 1: Initial store opening, training, and micro-roastery setup',
          'Phase 2: Achieving break-even point within the first 6-9 months',
          'Phase 3: Setting up a second mobile coffee cart operation'
        ],
        imageCategory: 'business'
      }
    ];
  }

  if (p.includes('market') || p.includes('business') || p.includes('strategy') || p.includes('corporate') || p.includes('sale')) {
    return [
      {
        id: 'slide_1',
        title: 'Strategic Business Acceleration',
        subtitle: `Action Plan for: "${prompt}"`,
        bullets: [
          'Capturing market share through disruptive value frameworks',
          'Optimizing core execution paths and cross-team alignment',
          'Leveraging advanced data-driven customer acquisition metrics'
        ],
        imageCategory: 'corporate'
      },
      {
        id: 'slide_2',
        title: 'Core Objectives & Key Results',
        subtitle: 'Structuring our goals for measurable success',
        bullets: [
          'Increase organic inbound leads by 45% quarter-over-quarter',
          'Reduce customer churn rate below 2% via premium success packages',
          'Establish three major enterprise channel partnerships by Q4'
        ],
        imageCategory: 'office'
      },
      {
        id: 'slide_3',
        title: 'Market Research & Customer Discovery',
        subtitle: 'Deep dive into user pain points and demographic segments',
        bullets: [
          'Surveys indicate 78% of users request automated dashboard features',
          'Primary target persona: Mid-market technology decision makers',
          'Secondary segment: Enterprise operations leads managing scaling teams'
        ],
        imageCategory: 'charts'
      },
      {
        id: 'slide_4',
        title: 'Operational Roadmap',
        subtitle: 'Milestones and key project timelines',
        bullets: [
          'Q1 - Architecture definition, security compliance audits, and team hires',
          'Q2 - Beta launch, user testing feedback, and initial feature pivots',
          'Q3 - Full public launch and global digital marketing expansion'
        ],
        imageCategory: 'roadmap'
      }
    ];
  }

  if (p.includes('tech') || p.includes('software') || p.includes('ai') || p.includes('app') || p.includes('web')) {
    return [
      {
        id: 'slide_1',
        title: 'Next-Generation Technology Solutions',
        subtitle: `Innovating on: "${prompt}"`,
        bullets: [
          'Building highly scalable microservices on secure cloud frameworks',
          'Automating core workflows with custom machine learning pipelines',
          'Delivering pixel-perfect, accessible client experiences'
        ],
        imageCategory: 'technology'
      },
      {
        id: 'slide_2',
        title: 'System Architecture Design',
        subtitle: 'Highly responsive, distributed, and secure by default',
        bullets: [
          'Containerized deployment pipelines running on orchestrators',
          'Real-time streaming and synchronization using high-speed message queues',
          'Global Content Delivery Networks for sub-100ms load times'
        ],
        imageCategory: 'server'
      },
      {
        id: 'slide_3',
        title: 'AI & Data Processing Layer',
        subtitle: 'Unlocking meaningful business insights through smart modeling',
        bullets: [
          'Pre-trained foundational models customized for industry use cases',
          'Retrieval Augmented Generation (RAG) querying private databases',
          'Anonymized, secure telemetry keeping customer data protected'
        ],
        imageCategory: 'artificial-intelligence'
      },
      {
        id: 'slide_4',
        title: 'Developer Operations & Growth',
        subtitle: 'Empowering rapid cycles and high system reliability',
        bullets: [
          'Automated security testing integrated directly in pull request stages',
          'Robust horizontal scaling rules based on current cpu and traffic alerts',
          'Global developer ecosystem API keys and extensive documentation portals'
        ],
        imageCategory: 'coding'
      }
    ];
  }

  // Fallback default strategic slides template
  return [
    {
      id: 'slide_1',
      title: 'Innovation & Strategy Overview',
      subtitle: `Topic exploration: "${prompt}"`,
      bullets: [
        'Defining our vision, objectives, and long-term positioning',
        'Leveraging cutting edge methods to resolve structural challenges',
        'Creating collaborative pathways for interdisciplinary teams'
      ],
      imageCategory: 'strategy'
    },
    {
      id: 'slide_2',
      title: 'Key Market Trends & Opportunities',
      subtitle: 'capitalizing on shifts in consumer and industry behavior',
      bullets: [
        'Recent digital acceleration demands highly modular system design',
        'Rising user expectations for premium, bespoke styling tools',
        'Untapped opportunities in cloud-based collaborative editing spaces'
      ],
      imageCategory: 'creative'
    },
    {
      id: 'slide_3',
      title: 'Detailed Action Plan',
      subtitle: 'Translating high-level visions into step-by-step deliverables',
      bullets: [
        'Establish core feature frameworks, layouts, and UX wireframes',
        'Launch cross-channel tests to gather critical qualitative inputs',
        'Scale systems progressively using MERN-standard reliable layers'
      ],
      imageCategory: 'design'
    },
    {
      id: 'slide_4',
      title: 'Conclusion & Next Steps',
      subtitle: 'Aligning teams for immediate execution plans',
      bullets: [
        'Finalize initial design choices and confirm architecture paths',
        'Approve resources, timelines, and launch concurrent development pipelines',
        'Open early preview systems for partner and developer feedback'
      ],
      imageCategory: 'success'
    }
  ];
};

// @route   POST api/ppt/generate
// @desc    Generate a highly informative AI PPT slide-deck JSON
router.post('/generate', authMiddleware, async (req, res) => {
  const { prompt, style, slideCount } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'A prompt description is required' });
  }

  try {
    const selectedStyle = style || 'Minimalist';
    const count = Number(slideCount) || 5;
    let slides = [];

    // Check if the user has configured the Google Gemini API Key
    if (process.env.GEMINI_API_KEY) {
      const apiKey = process.env.GEMINI_API_KEY;
      
      // Define system instructions requesting rich topical coverage
      const systemPrompt = `You are an expert presentation designer, industry researcher, and strategic consultant. Your job is to create an exceptionally detailed, accurate, and highly informative slide presentation deck on the topic: "${prompt}".

You MUST write highly detailed content. Every single slide must have deep, context-specific insights.
- Do NOT use generic descriptions or high-level summaries. 
- Bullet points must be fully developed sentences packed with actual details, definitions, strategies, logical points, and context related to "${prompt}".
- Make the information extremely educational, accurate, and rich in value.
- Avoid short or vague phrases like "Focus on goals" or "Market outreach". Instead, write comprehensive statements.

You must return ONLY a valid, parseable JSON array of slide objects matching the following JSON schema, with no additional markdown formatting, wrapper objects, explanation text, or backticks:
[
  {
    "id": "slide_1",
    "title": "A detailed, professional, and topic-specific slide title",
    "subtitle": "An informative, context-rich subtitle explaining the core focus of the slide",
    "bullets": [
      "A highly comprehensive and detailed sentence explaining a key concept, fact, or strategic parameter with specific details.",
      "A second highly comprehensive and detailed sentence adding additional data, implementation steps, or insights.",
      "A third highly comprehensive and detailed sentence outlining concrete methodology or execution paths.",
      "A fourth highly comprehensive and detailed sentence detailing expected outcomes, dependencies, or key metrics."
    ],
    "imageCategory": "unsplash search keyword representing this slide (e.g. city, agriculture, space, computing, analysis)"
  }
]

Generate exactly ${count} comprehensive, logically ordered slides. 
Slide 1 must be a Title/Intro slide. The intermediate slides must go deep into the technical, business, or operational details of the topic. The final slide must contain a detailed strategic summary, roadmap, or conclusion.
Return only the raw, minified JSON array.`;

      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-1.5-pro',
        'gemini-1.5-flash'
      ];
      
      let errors = [];
      let success = false;
      
      for (const model of modelsToTry) {
        try {
          console.log(`[PPT Generator] Attempting slide generation with model: ${model}`);
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          });

          if (response.ok) {
            const resJson = await response.json();
            if (resJson.candidates && resJson.candidates[0]?.content?.parts[0]?.text) {
              const rawText = resJson.candidates[0].content.parts[0].text.trim();
              const cleanText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
              const parsed = JSON.parse(cleanText);
              
              if (Array.isArray(parsed) && parsed.length > 0) {
                slides = parsed.map((s, idx) => ({
                  id: s.id || `slide_${idx + 1}`,
                  title: s.title || 'Untitled Slide',
                  subtitle: s.subtitle || '',
                  bullets: Array.isArray(s.bullets) ? s.bullets : [],
                  imageCategory: s.imageCategory || 'business'
                }));
                success = true;
                console.log(`[PPT Generator] Successfully generated presentation using model: ${model}`);
                break;
              }
            }
            errors.push(`${model}: Invalid or empty JSON response`);
          } else {
            const errBody = await response.json().catch(() => ({}));
            const errMsg = errBody.error?.message || response.statusText || 'Unknown error';
            console.warn(`[PPT Generator] Model ${model} returned status ${response.status}: ${errMsg}`);
            errors.push(`${model} (HTTP ${response.status}): ${errMsg}`);
          }
        } catch (err) {
          console.warn(`[PPT Generator] Model ${model} execution error:`, err.message);
          errors.push(`${model} (Exception): ${err.message}`);
        }
      }
      
      if (!success) {
        const combinedErrors = errors.join('; ');
        console.error(`[PPT Generator] All models failed. Key is configured but live generation failed: ${combinedErrors}`);
        return res.status(503).json({
          message: `Google Gemini API is currently unavailable or experiencing rate limits. Details: ${combinedErrors}. Please wait a moment and try again.`
        });
      }
    } else {
      // API Key not set - fall back to mock generator
      slides = generateMockSlides(prompt, selectedStyle);
    }

    // Extract first 4 words of the prompt as project name
    const projectName = prompt.split(' ').slice(0, 4).join(' ') + ' Presentation';

    const project = await PPTStore.create({
      userId: req.user.id,
      name: projectName,
      prompt,
      style: selectedStyle,
      slides
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('PPT generation error:', error);
    res.status(500).json({ message: 'Server error generating presentation slides' });
  }
});

// @route   GET api/ppt
// @desc    Get all PPT projects for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await PPTStore.findByUser(req.user.id);
    res.json(projects);
  } catch (error) {
    console.error('Fetch PPTs error:', error);
    res.status(500).json({ message: 'Server error retrieving presentations' });
  }
});

// @route   PUT api/ppt/:id
// @desc    Update a PPT project (slides content, theme style, or project name)
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, style, slides } = req.body;

  try {
    let project = await PPTStore.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Presentation project not found' });
    }

    if (project.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this presentation' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (style) updateData.style = style;
    if (slides) updateData.slides = slides;

    const updated = await PPTStore.update(req.params.id, updateData);
    res.json(updated);
  } catch (error) {
    console.error('Update PPT project error:', error);
    res.status(500).json({ message: 'Server error saving presentation updates' });
  }
});

// @route   DELETE api/ppt/:id
// @desc    Delete a PPT project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await PPTStore.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Presentation project not found' });
    }

    if (project.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this presentation' });
    }

    await PPTStore.delete(req.params.id);
    res.json({ message: 'Presentation successfully deleted' });
  } catch (error) {
    console.error('Delete PPT project error:', error);
    res.status(500).json({ message: 'Server error deleting presentation' });
  }
});

export default router;
