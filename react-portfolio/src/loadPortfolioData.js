export const SKILLS = [
  { icon: "fab fa-java", name: "Java" },
  { icon: "fab fa-python", name: "Python" },
  { icon: "fas fa-leaf", name: "Spring Boot" },
  { icon: "fas fa-brain", name: "Machine Learning" },
  { icon: "fas fa-link", name: "Blockchain" },
  { icon: "fab fa-node-js", name: "Node.js" },
  { icon: "fas fa-database", name: "SQL" },
  { icon: "fab fa-docker", name: "Docker" },
  { icon: "fas fa-server", name: "Redis & Nginx" },
  { icon: "fas fa-mobile-alt", name: "Flutter" },
  { icon: "fas fa-chart-bar", name: "Power BI" },
  { icon: "fab fa-js-square", name: "JavaScript" },
  { icon: "fab fa-html5", name: "HTML & CSS" },
]

export const EXPERIENCES = [
  {
    id: "liferythem",
    role: "Software Development Intern",
    company: "LifeRythem",
    badge: "Current",
    period: "March 2026 – Present",
    metrics: [
      { target: 90, suffix: "%", label: "Detection Accuracy" },
      { target: 4, suffix: "+", label: "IoT Devices" },
    ],
    achievements: [
      "Building a React Native APK with Kotlin native plugins integrating 4+ IoT medical devices (stethoscope, ECG, SpO2, weight machine) into a unified, streamlined doctor workflow system",
      "Engineered a CNN-based ML pipeline on stethoscope .wav auscultation data, achieving 90% detection accuracy for cardiac and pulmonary anomalies and enabling AI-assisted clinical diagnostics at the edge",
    ],
    tech: ["React Native", "Kotlin", "CNN", "TensorFlow/Keras", "Python", "IoT"],
  },
  {
    id: "drsga",
    role: "AI & ML Intern",
    company: "DRSGA",
    badge: "Technical",
    period: "December 2025 – January 2026",
    metrics: [
      { target: 80, suffix: "%", label: "Time Saved" },
      { target: 20, suffix: "+", label: "KPIs Tracked" },
      { target: 100, suffix: "+", label: "Feedbacks Analyzed" },
    ],
    achievements: [
      "Engineered a real-time NABH compliance dashboard using JavaScript and Chart.js, visualizing 20+ KPIs and reducing manual audit time by 80% via automated PDF generation",
      "Developed an ML-based NLP sentiment analysis system exposed via REST APIs, analyzing 100+ client feedback records to generate actionable insights for data-driven decision-making",
    ],
    tech: ["JavaScript", "Chart.js", "Machine Learning", "NLP", "REST APIs", "Python"],
  },
  {
    id: "jacob",
    role: "Web Project Developer",
    company: "JACOB Coaching Classes",
    badge: "Freelance",
    period: "July 2025",
    metrics: [
      { target: 50, suffix: "+", label: "Active Users" },
      { target: 100, suffix: "%", label: "On-Time Delivery" },
    ],
    achievements: [
      "Engineered a responsive web portal using HTML, CSS, JavaScript, and Google Apps Script, enabling over 50 students to seamlessly access class schedules and information online",
      "Delivered the project on time, resulting in a formal Letter of Recommendation (LOR) that validated the quality of work",
    ],
    tech: ["HTML5", "CSS3", "JavaScript", "Google Apps Script"],
  },
  {
    id: "super-ai",
    role: "Secretary",
    company: "Super-AI Community",
    badge: "Leadership",
    period: "July 2025 – Present",
    metrics: [
      { target: 15, suffix: "+", label: "Workshops Led" },
      { target: 40, suffix: "%", label: "Engagement Boost" },
      { target: 4, suffix: "", label: "Teams Managed" },
    ],
    achievements: [
      "Coordinated communication and documentation across technical and creative teams",
      "Orchestrated 15+ technical workshops and webinars, increasing community engagement by 40%",
    ],
    tech: ["Team Management", "Documentation", "Technical Workshops", "Community Building"],
  },
  {
    id: "junoon",
    role: "Resource Intern",
    company: "Junoon Foundation",
    badge: "Social Impact",
    period: "May 2024 – June 2024",
    metrics: [
      { target: 100, suffix: "+", label: "Students Reached" },
      { target: 30, suffix: "%", label: "Accessibility ↑" },
    ],
    achievements: [
      "Developed and delivered academic worksheets for underprivileged students",
      "Supported educational drives impacting 100+ students and improved learning accessibility",
    ],
    tech: ["Curriculum Design", "Educational Content", "Social Outreach"],
  },
  {
    id: "hackathons-competitions",
    role: "Participant & Finalist",
    company: "Various National Competitions",
    badge: "Achievements",
    period: "2024 – 2025",
    metrics: [
      { target: 8, suffix: "+", label: "Competitions" },
      { text: "Top 13", label: "NASA Global" },
      { text: "2nd", label: "IIT Kanpur" },
    ],
    achievements: [
      "NASA Space Apps 2025: Global Nominees - Top 13 from India out of 1,290+ projects worldwide for exoplanet detection using AI.",
      "Credtech Hackathon: 2nd Prize at a Credathon organized by IIT Kanpur for a credit assessment tool with an explainable AI dashboard.",
      "DIPEX 2025: Finalists for AI-powered women's safety application with offline capabilities",
    ],
    tech: ["Machine Learning", "Flutter", "React", "Blockchain", "Python", "Spring Boot", "Agentic AI"],
    details: [
      { title: "Smart India Hackathon 2025", desc: "Engineered an integrated safety ecosystem with Flutter app, React dashboard, and blockchain backend featuring AI-powered anomaly detection and automated e-FIR generation." },
      { title: "20th Aavishkar Research Convention 2025-26", desc: "Ranked 2nd in the Institute Round out of 48 selected project groups. Represented the college at the Zonal level, reaching the final round with the \"ResQ AI : Smart Tourist Safety System\"." },
      { title: "Ideathon 2025 - TCET", desc: "Presented AI-powered portfolio generator with conversational editor for natural language customization of design elements." },
      { title: "Multicon Research 2024", desc: "Written a research on \"Artificial Intelligence in Preventing Environmental Issues\" exploring predictive analytics for environmental monitoring." },
      { title: "Codethon 2024", desc: "3rd place in 90-minute competitive programming event on HackerRank, solving complex algorithmic challenges." },
    ],
  },
]

export const PROJECTS = [
  {
    title: "S.C.O.P.E. — Distributed Assessment Platform",
    desc: "A 4-role distributed assessment platform replacing third-party tools like HackerRank for institutional placement drives. Architected with Nginx least-conn load balancing, Redis async queuing, and Dockerized Judge0 execution nodes — validated at 0% failure rate across 40,000 requests at 200 concurrent connections, supporting 1,000+ concurrent users.",
    tech: ["React", "Node.js", "PostgreSQL", "Linux", "Redis", "Nginx", "Docker", "Judge0"],
  },
  {
    title: "Tourist Guardian Safety Platform",
    desc: "A comprehensive safety ecosystem designed for the Smart India Hackathon, featuring a tourist mobile app and a police dashboard. The system uses an AI engine for real-time anomaly detection and an agentic system to auto-generate e-FIRs, all verified through a secure blockchain backend.",
    tech: ["Flutter", "React", "Node.js", "Blockchain", "Python"],
    github: "https://github.com/Ganesh-AIML/ResQ-AI",
  },
  {
    title: "Alertica - AI Women's Safety App",
    desc: "A personal safety application providing immediate assistance in emergencies. It actively monitors the user's environment using voice anomaly detection to identify distress signals and features silent SOS activation, geofencing for safe-zone alerts, and emergency API integration.",
    tech: ["Flutter", "Firebase", "Node.js", "REST APIs"],
    github: "https://github.com/Ganesh-AIML/Alertica-AI-Powered-Women-Safety-APK",
  },
  {
    title: "LearnSphere",
    desc: "A secure Learning Management System with REST APIs for course management, student enrollment, and assessments. Features include role-based authentication (Student/Instructor/Admin), modular course content organization, automated quiz engine with MCQ and text questions, progress tracking, discussion forums, and course feedback. Built with Spring Boot, JWT security, and JPA for reliable data persistence.",
    tech: ["Spring Boot", "PostgreSQL", "REST APIs"],
    github: "https://github.com/Ganesh-AIML/Learnshere",
  },
  {
    title: "Exoplanet Detection & Habitability Classifier",
    desc: "An AI/ML-powered system utilizing NASA's Kepler & TESS datasets to detect and classify potentially habitable exoplanets. Features include an interactive Flask dashboard, dynamic visualizations of orbital metrics, and model interpretability using SHAP.",
    tech: ["Python (Flask)", "XGBoost", "Scikit-Learn", "Plotly"],
    github: "https://github.com/Ganesh-AIML/Exoplanet-Classifier",
  },
]

export const CERTIFICATES = [
  { name: "DIPEX (Finalist)", issuer: "COEP Technological University", img: "assests/DIPEX_Certificate(1).jpeg" },
  { name: "CredTech Hackathon (1st Runner-up)", issuer: "IIT Kanpur", img: "assests/Credtech certificate.png" },
  { name: "CODEHATHON (3rd Prize)", issuer: "TCET Mumbai", img: "assests/Codethon.png" },
  { name: "Letter of Recommendation (LOR)", issuer: "Jacob Classes", img: "assests/LOR.png" },
  { name: "Ideathon (Participant)", issuer: "TCET Mumbai", img: "assests/Ideathon.jpeg" },
  { name: "Multicon Research Paper", issuer: "TCET Mumbai", img: "assests/multicon.png" },
  { name: "Python Training - Spoken Tutorial", issuer: "IIT Bombay", img: "assests/spoken tutorial certificate.png" },
]
