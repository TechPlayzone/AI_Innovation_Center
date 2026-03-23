// config/workspaceContent.js
// Major-specific workspace content: AI tools, use cases, suggested questions

export const WORKSPACE_CONTENT = {
  general: {
    label: "General / Exploring",
    tools: [
      { name: "ChatGPT", desc: "General-purpose AI assistant for writing, research, and problem-solving" },
      { name: "Claude", desc: "Thoughtful AI for analysis, summarization, and long-form tasks" },
      { name: "Gemini", desc: "Google's AI integrated with search and productivity tools" },
      { name: "Perplexity", desc: "AI-powered search engine with cited answers" },
      { name: "Notion AI", desc: "AI built into note-taking and project management" }
    ],
    useCases: [
      "Drafting emails, reports, and presentations",
      "Summarizing long documents or research papers",
      "Brainstorming ideas for projects or assignments",
      "Getting quick explanations of complex topics",
      "Creating study guides and practice questions"
    ],
    suggestedQuestions: [
      "What AI tools should every college student know?",
      "How can AI help me with my homework without cheating?",
      "What careers will AI create in the next 5 years?",
      "How do I start learning AI skills today?"
    ]
  },
  construction: {
    label: "Construction Management",
    tools: [
      { name: "Autodesk AI", desc: "AI-powered BIM, generative design, and project analytics" },
      { name: "Buildots", desc: "Computer vision for automated site progress tracking" },
      { name: "Alice Technologies", desc: "AI for construction scheduling and resource optimization" },
      { name: "Smartvid.io", desc: "AI safety monitoring from jobsite photos and video" },
      { name: "Procore AI", desc: "AI insights embedded in construction project management" }
    ],
    useCases: [
      "Automated cost estimation from project drawings",
      "AI-powered safety monitoring on job sites",
      "Predictive scheduling to avoid project delays",
      "BIM clash detection before construction begins",
      "Real-time progress tracking with computer vision"
    ],
    suggestedQuestions: [
      "How is AI changing job site safety monitoring?",
      "What is BIM and how does AI improve it?",
      "Can AI help predict construction project delays?",
      "What AI skills will make me stand out as a construction manager?"
    ]
  },
  architecture: {
    label: "Architecture",
    tools: [
      { name: "Midjourney / DALL-E", desc: "AI image generation for concept visualization" },
      { name: "Autodesk Forma", desc: "AI for early-stage site analysis and generative design" },
      { name: "Spacemaker", desc: "AI urban design and building placement optimization" },
      { name: "TestFit", desc: "Automated building feasibility and layout generation" },
      { name: "cove.tool", desc: "AI for energy modeling and sustainability analysis" }
    ],
    useCases: [
      "Generating design concepts from text descriptions",
      "Automated energy performance analysis",
      "Code compliance checking before submission",
      "Site analysis for sun, wind, and shadow patterns",
      "Rapid massing studies and layout optimization"
    ],
    suggestedQuestions: [
      "How are architects using AI for generative design?",
      "Can AI check if my building design meets code?",
      "What is the role of AI in sustainable architecture?",
      "Will AI replace architects or make them more powerful?"
    ]
  },
  electronics: {
    label: "Electronics Engineering Technology",
    tools: [
      { name: "Cadence AI", desc: "AI-assisted PCB layout and circuit optimization" },
      { name: "Ansys AI", desc: "AI-powered simulation for electronics and thermal analysis" },
      { name: "Synopsys AI", desc: "AI for chip design and verification" },
      { name: "TensorFlow Lite", desc: "AI/ML deployment on embedded and edge devices" },
      { name: "Edge Impulse", desc: "AI model training for microcontrollers and IoT" }
    ],
    useCases: [
      "Automated PCB fault detection and diagnosis",
      "AI-assisted component selection and sourcing",
      "Predictive maintenance for electronic systems",
      "Machine learning on embedded microcontrollers",
      "AI-powered test automation and quality control"
    ],
    suggestedQuestions: [
      "How is AI being used in circuit design?",
      "What is edge AI and why does it matter for electronics?",
      "How can I put machine learning on a microcontroller?",
      "What AI skills do electronics engineers need today?"
    ]
  },
  accounting: {
    label: "Accounting",
    tools: [
      { name: "Intuit AI", desc: "AI integrated into QuickBooks for smart bookkeeping" },
      { name: "Workiva", desc: "AI for financial reporting and audit trail management" },
      { name: "MindBridge", desc: "AI-powered audit analytics and anomaly detection" },
      { name: "Avalara", desc: "AI for automated tax compliance and calculations" },
      { name: "Domo AI", desc: "AI business intelligence and financial forecasting" }
    ],
    useCases: [
      "Automated invoice processing and categorization",
      "AI fraud detection in financial transactions",
      "Real-time cash flow forecasting",
      "Intelligent audit sampling and risk flagging",
      "Automated tax preparation and compliance checking"
    ],
    suggestedQuestions: [
      "How is AI changing the accounting profession?",
      "Can AI detect financial fraud automatically?",
      "Will AI replace accountants or just the boring tasks?",
      "What AI tools do accounting firms use right now?"
    ]
  },
  business: {
    label: "Business & Entrepreneurship",
    tools: [
      { name: "HubSpot AI", desc: "AI for CRM, marketing automation, and customer insights" },
      { name: "Jasper", desc: "AI content generation for marketing and brand voice" },
      { name: "Salesforce Einstein", desc: "AI sales forecasting and customer intelligence" },
      { name: "Canva AI", desc: "AI-powered design for marketing materials and branding" },
      { name: "Beautiful.ai", desc: "AI presentation builder for pitch decks and proposals" }
    ],
    useCases: [
      "AI-powered market research and competitor analysis",
      "Automated customer segmentation and targeting",
      "AI content creation for social media and marketing",
      "Business plan generation and financial modeling",
      "Customer sentiment analysis from reviews and feedback"
    ],
    suggestedQuestions: [
      "How can AI help me start a business with less money?",
      "What AI tools do entrepreneurs use for marketing?",
      "How do I use AI to research my target market?",
      "Can AI help me write a business plan?"
    ]
  },
  cloud: {
    label: "Cloud Computing",
    tools: [
      { name: "AWS SageMaker", desc: "Amazon's platform for building and deploying ML models" },
      { name: "Azure AI Services", desc: "Microsoft's suite of cloud AI APIs and cognitive services" },
      { name: "Google Vertex AI", desc: "Google Cloud's unified ML platform" },
      { name: "Databricks", desc: "Unified analytics platform for big data and AI" },
      { name: "Snowflake Cortex", desc: "AI and ML built directly into the cloud data platform" }
    ],
    useCases: [
      "Deploying ML models as scalable cloud APIs",
      "Building serverless AI-powered applications",
      "Real-time data pipelines for AI model training",
      "Cost optimization for AI workloads in the cloud",
      "MLOps — automating model training, testing, and deployment"
    ],
    suggestedQuestions: [
      "What is MLOps and why is it important?",
      "How do AWS, Azure, and Google Cloud compare for AI?",
      "How do I deploy a machine learning model to the cloud?",
      "What cloud certifications should I get for AI careers?"
    ]
  },
  cybersecurity: {
    label: "Cybersecurity",
    tools: [
      { name: "Darktrace", desc: "AI that detects and responds to cyber threats in real time" },
      { name: "CrowdStrike Falcon", desc: "AI-powered endpoint detection and threat hunting" },
      { name: "Splunk AI", desc: "AI for log analysis, SIEM, and security operations" },
      { name: "Microsoft Sentinel", desc: "Cloud-native AI security information and event management" },
      { name: "Vectra AI", desc: "AI network detection and response for hybrid environments" }
    ],
    useCases: [
      "AI-powered threat detection and real-time alerting",
      "Automated log analysis and anomaly detection",
      "AI vulnerability scanning and risk prioritization",
      "Behavioral analysis to detect insider threats",
      "Automated incident response and playbook execution"
    ],
    suggestedQuestions: [
      "How is AI being used to detect cyber attacks?",
      "What is adversarial AI and why should I know about it?",
      "How do security operations centers use AI today?",
      "What cybersecurity AI skills are employers looking for?"
    ]
  }
};
