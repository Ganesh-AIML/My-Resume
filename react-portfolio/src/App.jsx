import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, animate } from "motion/react"
import "./App.css"
import RobotAssistant from "./RobotAssistant"

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
    id: "liferythem", role: "Software Development Intern", company: "LifeRythem",
    badge: "Current", period: "March 2026 – Present",
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
    id: "drsga", role: "AI & ML Intern", company: "DRSGA",
    badge: "Technical", period: "December 2025 – January 2026",
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
    id: "jacob", role: "Web Project Developer", company: "JACOB Coaching Classes",
    badge: "Freelance", period: "July 2025",
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
    id: "super-ai", role: "Secretary", company: "Super-AI Community",
    badge: "Leadership", period: "July 2025 – Present",
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
    id: "junoon", role: "Resource Intern", company: "Junoon Foundation",
    badge: "Social Impact", period: "May 2024 – June 2024",
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
    id: "hackathons", role: "Participant & Finalist", company: "Various National Competitions",
    badge: "Achievements", period: "2024 – 2025",
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
      { title: "20th Aavishkar Research Convention 2025-26", desc: "Ranked 2nd in the Institute Round out of 48 selected project groups. Represented the college at the Zonal level, reaching the final round with the 'ResQ AI : Smart Tourist Safety System'." },
      { title: "Ideathon 2025 - TCET", desc: "Presented AI-powered portfolio generator with conversational editor for natural language customization of design elements." },
      { title: "Multicon Research 2024", desc: "Written a research on 'Artificial Intelligence in Preventing Environmental Issues' exploring predictive analytics for environmental monitoring." },
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
    desc: "A secure Learning Management System with REST APIs for course management, student enrollment, and assessments. Features include role-based authentication (Student/Instructor/Admin), modular course content organization, automated quiz engine with MCQ and text questions, progress tracking, discussion forums, and course feedback.",
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

const PHRASES = ["intelligent systems.", "AI-driven products.", "scalable backends.", "data-driven apps."]

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
}

function AnimatedNumber({ target, suffix, trigger }) {
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (!trigger) return
    setDisplay("0")
    const duration = 1200
    const start = performance.now()
    let raf
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.floor(e * target) + suffix)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, suffix, trigger])

  return <>{display}</>
}

function TypingEffect() {
  const [displayed, setDisplayed] = useState("")
  const [idx, setIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) {
      const t = setTimeout(() => setStarted(true), 1000)
      return () => clearTimeout(t)
    }
    const current = PHRASES[phraseIdx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (idx < current.length) {
          setDisplayed(current.substring(0, idx + 1))
          setIdx((i) => i + 1)
        } else {
          setDeleting(true)
        }
      } else {
        if (idx > 0) {
          setDisplayed(current.substring(0, idx - 1))
          setIdx((i) => i - 1)
        } else {
          setDeleting(false)
          setPhraseIdx((i) => (i + 1) % PHRASES.length)
        }
      }
    }, deleting ? 40 : idx === current.length ? 1800 : 90)
    return () => clearTimeout(timeout)
  }, [idx, deleting, phraseIdx, started])

  return <span className="typing-text">{displayed}</span>
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress((scrollTop / docHeight) * 100)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="scroll-progress">
      <div className="scroll-progress-bar" style={{ width: progress + "%" }} />
    </div>
  )
}

function BackgroundOrbs() {
  return (
    <div className="bg-orbs" aria-hidden="true">
      <span className="orb orb-1" />
      <span className="orb orb-2" />
      <span className="orb orb-3" />
    </div>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return (
    <header id="main-nav" className={scrolled ? "scrolled" : ""}>
      <motion.a href="#" className="logo"
        whileHover={{ scale: 1.1, rotate: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}>
        GS<span className="logo-dot">.</span>
      </motion.a>
      <nav>
        <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
          {["About", "Experience", "Projects", "Contact"].map((item, i) => (
            <li key={item}>
              <motion.a href={`#${item.toLowerCase()}`} className="nav-link"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                onClick={() => setMenuOpen(false)}>
                <span className="nav-num" />{item}
              </motion.a>
            </li>
          ))}
          <li className="mobile-social-links">
            <a href="https://github.com/Ganesh-AIML" target="_blank" rel="noopener noreferrer"><i className="fab fa-github" /></a>
            <a href="https://www.linkedin.com/in/ganesh-singh-aiml" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in" /></a>
          </li>
        </ul>
      </nav>
      <button className={`hamburger-menu ${menuOpen ? "active" : ""}`}
        aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
        <span className="bar" /><span className="bar" /><span className="bar" />
      </button>
    </header>
  )
}

const animProps = (delay) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.4, 0, 0.2, 1] },
})

function Hero() {
  return (
    <section id="hero">
      <div className="hero-content">
        <motion.h1 {...animProps(0.1)}>
          <span className="hero-greeting">👋 Hello, I'm</span>
        </motion.h1>
        <motion.h2 className="name" {...animProps(0.25)}>
          <span className="name-gradient">Ganesh Singh</span><span className="name-dot">.</span>
        </motion.h2>
        <motion.h3 className="tagline" {...animProps(0.4)}>
          I build <TypingEffect />
        </motion.h3>
        <motion.p {...animProps(0.55)}>
          A B.Tech student and aspiring AI & ML Engineer dedicated to leveraging technology to build impactful solutions. I specialize in developing robust web applications and solving complex, data-driven challenges.
        </motion.p>
        <motion.div className="hero-cta" {...animProps(0.7)}>
          <motion.a href="#projects" className="btn primary"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <span>View My Work</span>
            <i className="fas fa-arrow-right" />
          </motion.a>
          <motion.a href="assests/Ganesh_Resume.pdf" className="btn" download
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <span>Download Resume</span>
            <i className="fas fa-download" />
          </motion.a>
        </motion.div>
      </div>
      <motion.div className="hero-pic" {...animProps(0.3)}>
        <div className="hero-pic-frame">
          <img src="assests/gemini_profile.png" alt="Ganesh Singh" />
        </div>
        <div className="hero-pic-glow" />
      </motion.div>
      <a href="#about" className="scroll-indicator" aria-label="Scroll down">
        <span className="mouse"><span className="wheel" /></span>
        <span className="scroll-text">Scroll</span>
      </a>
    </section>
  )
}

function SkillCard({ skill, index, hoveredIndex, onHoverStart, cols }) {
  const cardRef = useRef(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const wave = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [-6, 6]), { stiffness: 250, damping: 25 })
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [6, -6]), { stiffness: 250, damping: 25 })

  const intensity = useMemo(() => {
    if (hoveredIndex === -1 || cols === undefined) return 0
    const hRow = Math.floor(hoveredIndex / cols)
    const hCol = hoveredIndex % cols
    const row = Math.floor(index / cols)
    const col = index % cols
    const dist = Math.sqrt((row - hRow) ** 2 + (col - hCol) ** 2)
    return 1 / (1 + dist * 0.2)
  }, [hoveredIndex, index, cols])

  useEffect(() => {
    if (hoveredIndex === -1 || cols === undefined) {
      const c = animate(wave, 0, { duration: 0.3, ease: "easeOut" })
      return () => c.stop()
    }
    const hRow = Math.floor(hoveredIndex / cols)
    const hCol = hoveredIndex % cols
    const row = Math.floor(index / cols)
    const col = index % cols
    const dist = Math.sqrt((row - hRow) ** 2 + (col - hCol) ** 2)
    const delay = Math.min(dist * 0.1, 0.8)
    wave.jump(0)
    const c = animate(wave, 1, {
      duration: 1.0,
      delay,
      ease: "easeInOut",
    })
    return () => c.stop()
  }, [hoveredIndex, index, cols])

  const waveY = useTransform(wave, (v) => -10 * intensity * Math.sin(v * Math.PI))
  const waveScale = useTransform(wave, (v) => 1 + 0.03 * intensity * Math.sin(v * Math.PI))
  const waveBorder = useTransform(wave, (v) => {
    const alpha = intensity * Math.sin(v * Math.PI)
    if (alpha < 0.005) return ""
    return `rgba(0, 90, 156, ${alpha})`
  })
  const waveBorderWidth = useTransform(wave, (v) => {
    const alpha = intensity * Math.sin(v * Math.PI)
    if (alpha < 0.005) return ""
    return `${1 + alpha * 2}px`
  })

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.div ref={cardRef} className="skill-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => onHoverStart(index)}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } },
        hover: { transition: { staggerChildren: 0.06 } },
      }}
      style={{ rotateX, rotateY, y: waveY, scale: waveScale, borderColor: waveBorder, borderWidth: waveBorderWidth }}
      whileHover="hover">
      <motion.i className={skill.icon}
        variants={{ hover: { scale: 1.15, rotate: -8 } }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }} />
      <motion.p variants={{ hover: { color: "var(--accent-color)" } }}
        transition={{ duration: 0.2 }}>{skill.name}</motion.p>
    </motion.div>
  )
}

function About() {
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const gridRef = useRef(null)
  const [cols, setCols] = useState(4)

  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const updateCols = () => {
      const template = getComputedStyle(el).gridTemplateColumns
      setCols(template.split(" ").length)
    }
    updateCols()
    const ro = new ResizeObserver(updateCols)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <motion.section id="about"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}>
      <h2><span className="section-num" /> About Me</h2>
      <div className="about-content">
        <p>I am a results-driven AI & ML student with a strong foundation in both software development and data science. My hands-on experience includes building full-stack applications and developing predictive models. I am passionate about applying my skills to create innovative and effective solutions, and I excel in collaborative environments.</p>
        <motion.div ref={gridRef} className="skills-grid"
          onMouseLeave={() => setHoveredIndex(-1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}>
          {SKILLS.map((s, i) => (
            <SkillCard key={s.name} skill={s} index={i} cols={cols}
              hoveredIndex={hoveredIndex}
              onHoverStart={setHoveredIndex} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

function MetricCard({ metric, trigger }) {
  if (metric.text !== undefined) {
    return (
      <div className="metric-card">
        <span className="metric-number-text">{metric.text}</span>
        <span className="metric-label">{metric.label}</span>
      </div>
    )
  }
  return (
    <div className="metric-card">
      <span className="metric-number"><AnimatedNumber target={metric.target} suffix={metric.suffix || ""} trigger={trigger} /></span>
      <span className="metric-label">{metric.label}</span>
    </div>
  )
}

function ExperienceCard({ exp, isActive, metricsRun, clickTick }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [animTrigger, setAnimTrigger] = useState(0)
  const [beamKey, setBeamKey] = useState(0)
  const cardRef = useRef(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const layerX = (range) => useSpring(useTransform(mouseX, [0, 1], [-range, range]), { stiffness: 200, damping: 25 })
  const layerY = (range) => useSpring(useTransform(mouseY, [0, 1], [-range, range]), { stiffness: 200, damping: 25 })

  const headerX = layerX(6)
  const headerY = layerY(6)
  const metricsX = layerX(10)
  const metricsY = layerY(10)
  const achievementsX = layerX(12)
  const achievementsY = layerY(12)
  const floatingX = layerX(16)
  const floatingY = layerY(16)

  useEffect(() => {
    if (isActive && metricsRun) {
      setAnimTrigger(t => t + 1)
    }
  }, [isActive, metricsRun, clickTick])

  useEffect(() => {
    if (isActive) setBeamKey(k => k + 1)
  }, [isActive])

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.div ref={cardRef}
      className={`spotlight-card${isActive ? " active" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 30,
        scale: isActive ? 1 : 0.95,
      }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}>
      <motion.div key={beamKey} className="spotlight-beam"
        initial={{ x: "-30%", opacity: 0 }}
        animate={{ x: "130%", opacity: [0, 0.7, 0.7, 0] }}
        transition={{ duration: 0.9, delay: 0.15, ease: "easeInOut" }} />
      <motion.div className="parallax-layer" style={{ x: headerX, y: headerY }}>
        <div className="exp-card-header">
          <div className="card-title-row">
            <div className="card-title">
              <h3>{exp.role}</h3>
              <div className="company-name">@ {exp.company}</div>
            </div>
            <span className="highlight-badge">{exp.badge}</span>
          </div>
          <div className="date-period"><i className="far fa-calendar" /><span>{exp.period}</span></div>
        </div>
      </motion.div>
      <motion.div className="parallax-layer" style={{ x: metricsX, y: metricsY }}>
        <motion.div className="impact-metrics"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}>
          {exp.metrics.map((m, i) => (
            <motion.div key={i}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}>
              <MetricCard metric={m} trigger={animTrigger} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      <motion.div className="parallax-layer" style={{ x: achievementsX, y: achievementsY }}>
        <div className="achievements-section">
          <h4>Key Achievements</h4>
          <motion.ul className="achievement-list"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}>
            {exp.achievements.map((a, i) => (
              <motion.li key={i}
                variants={{
                  hidden: { opacity: 0, x: -15 },
                  visible: { opacity: 1, x: 0 },
                }}>
                {a}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
      <motion.div className="parallax-layer" style={{ x: floatingX, y: floatingY }}>
        {exp.details && (
          <div className="details-toggle">
            <button className={`toggle-btn${detailsOpen ? " expanded" : ""}`}
              onClick={() => setDetailsOpen(!detailsOpen)}>
              <span>{detailsOpen ? "Hide Competitions" : "View All Competitions"}</span>
              <i className="fas fa-chevron-down" />
            </button>
            <div className={`details-content${detailsOpen ? " expanded" : ""}`}>
              {exp.details.map((d, i) => (
                <div key={i} className="sub-item">
                  <h5>{d.title}</h5>
                  <p>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <motion.div className="tech-stack"
          variants={{ hover: { transition: { staggerChildren: 0.1 } } }}
          whileHover="hover">
          {exp.tech.map((t) => (
            <motion.span key={t} className="tech-badge"
              variants={{ hover: { rotateY: 360 } }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}>
              {t}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function Experience() {
  const [activeId, setActiveId] = useState("liferythem")
  const [metricsRun, setMetricsRun] = useState(false)
  const [clickTick, setClickTick] = useState(0)
  const timelineRef = useRef(null)

  const handleTimelineClick = (id) => {
    setActiveId(id)
    setMetricsRun(true)
    setClickTick(t => t + 1)
    if (window.innerWidth <= 768 && timelineRef.current) {
      const item = timelineRef.current.querySelector(`[data-id="${id}"]`)
      if (item) item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    }
  }

  return (
    <motion.section id="experience"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      onViewportEnter={() => setMetricsRun(true)}
      viewport={{ once: true, margin: "-100px" }}>
      <h2><span className="section-num" /> Work Experience</h2>
      <div className="experience-subtitle">
        <p>A journey through impactful projects, leadership roles, and competitive achievements</p>
      </div>
      <div className="spotlight-timeline">
        <div className="timeline-nav">
          <div className="timeline-track" ref={timelineRef}>
            {EXPERIENCES.map((exp) => (
              <motion.div key={exp.id}
                className={`timeline-item${activeId === exp.id ? " active" : ""}`}
                data-id={exp.id}
                onClick={() => handleTimelineClick(exp.id)}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <div className="timeline-dot" />
                <div className="timeline-label">
                  <div className="role">{exp.role}</div>
                  <div className="org">{exp.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="spotlight-card-container">
          {EXPERIENCES.map((exp) => (
            <ExperienceCard key={exp.id} exp={exp} isActive={activeId === exp.id} metricsRun={metricsRun} clickTick={clickTick} />
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function ProjectCard({ project, index }) {
  const cardRef = useRef(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), { stiffness: 250, damping: 25 })
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), { stiffness: 250, damping: 25 })

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)
    cardRef.current.style.setProperty("--mouse-x", e.clientX - rect.left + "px")
    cardRef.current.style.setProperty("--mouse-y", e.clientY - rect.top + "px")
  }

  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.div ref={cardRef} className="project-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ rotateX, rotateY }}
      variants={{ hover: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } } }}
      whileHover="hover">
      <div className="card-glow" />
      <motion.div className="card-header"
        variants={{ hover: { y: -2 } }}>
        <div className="folder-icon"><motion.i className="far fa-folder-open"
          variants={{ hover: { scale: 1.15, rotate: -10 } }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }} /></div>
        {project.github && (
          <div className="card-links">
            <motion.a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
              variants={{ hover: { y: -3 } }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}>
              <i className="fab fa-github" />
            </motion.a>
          </div>
        )}
      </motion.div>
      <motion.div className="card-body"
        variants={{ hover: { y: 2 } }}>
        <motion.h3 variants={{ hover: { color: "var(--accent-color)", x: 3 } }}>{project.title}</motion.h3>
        <motion.p variants={{ hover: { x: 2 } }}>{project.desc}</motion.p>
        <motion.ul className="tech-list"
          variants={{ hover: { transition: { staggerChildren: 0.03 } } }}>
          {project.tech.map((t) => (
            <motion.li key={t}
              variants={{ hover: { scale: 1.08, y: -2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}>
              {t}
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </motion.div>
  )
}

function Projects() {
  return (
    <motion.section id="projects"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}>
      <h2><span className="section-num" /> My Projects</h2>
      <div className="project-grid">
        {PROJECTS.map((p, i) => <ProjectCard key={p.title} project={p} index={i} />)}
      </div>
    </motion.section>
  )
}

function ImageModal({ data, onClose }) {
  return (
    <motion.div className="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }} />
      <motion.div className="modal-content"
        initial={{ opacity: 0, scale: 0.9, rotateX: 10, rotateY: -10, y: 40 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, rotateX: -5, rotateY: 5, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}>
        <button className="close-modal" onClick={onClose}>&times;</button>
        <div className="cert-frame">
          <img src={data.src} alt="Certificate" />
          {data.name && <p className="cert-caption">{data.name}</p>}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Certificates({ onViewImage }) {
  return (
    <motion.section id="certificates"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}>
      <h2>Certificates & Achievements</h2>
      <motion.div className="certificate-list"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.07 } },
        }}>
        {CERTIFICATES.map((c) => (
          <motion.div key={c.name} className="certificate-item"
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 },
            }}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <div>
              <h3>{c.name}</h3>
              <p className="issuer">{c.issuer}</p>
            </div>
            <motion.button className="btn view-certificate-btn"
              onClick={() => onViewImage({ src: c.img, name: c.name })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}>
              View
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

function Contact() {
  return (
    <motion.section id="contact"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}>
      <div className="contact-content">
        <span className="contact-pill">What's Next?</span>
        <h2>Get In Touch</h2>
        <p>I am currently open to new opportunities and collaborations. If you have a question or an idea, or just want to connect, please feel free to reach out. I look forward to hearing from you!</p>
        <motion.a href="mailto:ganeshsingh71680@gmail.com" className="btn primary"
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}>
          <span>Say Hello</span>
          <i className="fas fa-paper-plane" />
        </motion.a>
      </div>
    </motion.section>
  )
}

export default function App() {
  const [modalData, setModalData] = useState(null)

  useEffect(() => {
    if (modalData) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [modalData])

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setModalData(null) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <ScrollProgress />
      <BackgroundOrbs />
      <Header />
      <div className="social-sidebar">
        <a href="https://github.com/Ganesh-AIML" target="_blank" rel="noopener noreferrer"><i className="fab fa-github" /></a>
        <a href="https://www.linkedin.com/in/ganesh-singh-aiml" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in" /></a>
      </div>
      <main className="container">
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Certificates onViewImage={setModalData} />
          <Contact />
        </main>
        <footer>
          <p>Designed & Built by <span className="footer-highlight">Ganesh Singh</span> &copy; 2025</p>
        </footer>
        <AnimatePresence>
          {modalData && <ImageModal data={modalData} onClose={() => setModalData(null)} />}
        </AnimatePresence>
        <RobotAssistant />
    </>
  )
}
