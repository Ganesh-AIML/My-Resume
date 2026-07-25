import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, animate } from "motion/react"
import "./App.css"
import RobotAssistant from "./RobotAssistant"
import { SKILLS, EXPERIENCES, PROJECTS, CERTIFICATES } from "./loadPortfolioData"

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
