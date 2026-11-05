import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChatEngine } from "../chatService"
import { Icon } from "../components/Icon"
import { ease } from "../motion/primitives"
import "./chat.css"

const GREETING = "Hi — I answer questions about Ganesh's projects, experience and skills using his portfolio data. What would you like to know?"
const SUGGESTIONS = ["What did he build at Boomlet?", "How does S.C.O.P.E. handle 1,000+ users?", "Tell me about the College RAG Assistant"]

function Markdown({ content }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => <img src={src} alt={alt || ""} loading="lazy" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

/**
 * Chat panel for the portfolio assistant (Groq RAG via chatService.js).
 * Lazy-loaded: react-markdown and the portfolio data only download on first open.
 */
export default function AgentChat({ open, onClose }) {
  const [messages, setMessages] = useState([{ role: "bot", text: GREETING }])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const lastFocus = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, thinking])

  useEffect(() => {
    if (!open) return
    lastFocus.current = document.activeElement
    const t = setTimeout(() => inputRef.current?.focus(), 120)
    const onKey = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener("keydown", onKey)
      lastFocus.current?.focus?.()
    }
  }, [open, onClose])

  const send = useCallback(
    async (text) => {
      const msg = (text ?? input).trim()
      if (!msg || thinking) return
      setMessages((m) => [...m, { role: "user", text: msg }])
      setInput("")
      setThinking(true)
      try {
        const res = await ChatEngine(msg)
        setMessages((m) => [...m, { role: "bot", text: res }])
      } catch {
        setMessages((m) => [...m, { role: "bot", text: "The assistant could not be reached. Check your connection and try again, or email Ganesh directly." }])
      } finally {
        setThinking(false)
      }
    },
    [input, thinking],
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="chat-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="chat"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ duration: 0.55, ease: ease.out }}
          >
            <header className="chat-head">
              <div>
                <p id="chat-title" className="chat-title">
                  Ask about Ganesh
                </p>
                <p className="chat-sub">AI answers from portfolio data. They can be wrong.</p>
              </div>
              <button type="button" className="chat-close" onClick={onClose} aria-label="Close assistant">
                <Icon name="close" size={18} />
              </button>
            </header>

            <div className="chat-body" ref={bodyRef} aria-live="polite">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={`msg msg--${m.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: ease.out }}
                >
                  {m.role === "bot" ? <Markdown content={m.text} /> : m.text}
                </motion.div>
              ))}
              {thinking && (
                <div className="msg msg--bot msg--thinking" aria-label="Assistant is typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}
              {messages.length === 1 && (
                <div className="chat-suggest">
                  {SUGGESTIONS.map((s) => (
                    <button type="button" key={s} onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              className="chat-form"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <label htmlFor="chat-input" className="sr-only">
                Your question
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                type="text"
                autoComplete="off"
                placeholder="Ask a question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={thinking}
              />
              <button type="submit" disabled={!input.trim() || thinking} aria-label="Send question">
                <Icon name="send" size={18} />
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
