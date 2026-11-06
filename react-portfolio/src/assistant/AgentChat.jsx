import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChatEngine, isConfigured, resetChat } from "../chatService"
import { Icon } from "../components/Icon"
import { ease } from "../motion/primitives"
import "./chat.css"

const GREETING = "Hey 👋 I'm Ganesh's AI sidekick. Ask me anything about his work and I'll keep it short. Promise."
const SUGGESTIONS = ["Why should I hire Ganesh?", "What's the coolest thing he's built?", "What did he do at Boomlet?", "Is he open to work?"]
const FAIL = "Lost the connection for a sec. Try again, or email Ganesh at **ganeshsingh71680@gmail.com**."

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

const fresh = () => [{ id: 0, role: "bot", text: GREETING }]

/**
 * Chat panel for the portfolio assistant (Gemini via chatService.js).
 * Replies stream in token by token; Stop cancels, New chat clears memory.
 * Lazy-loaded: react-markdown and the portfolio data only download on first open.
 */
export default function AgentChat({ open, onClose }) {
  const [messages, setMessages] = useState(fresh)
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false) // waiting or streaming
  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const lastFocus = useRef(null)
  const abortRef = useRef(null)
  const idRef = useRef(1)

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

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

  // Cancel an in-flight reply if the panel unmounts.
  useEffect(() => () => abortRef.current?.abort(), [])

  const send = useCallback(
    async (text) => {
      const msg = (text ?? input).trim()
      if (!msg || busy) return
      const botId = idRef.current++
      setMessages((m) => [...m, { id: idRef.current++, role: "user", text: msg }])
      setInput("")
      setBusy(true)
      const ctrl = new AbortController()
      abortRef.current = ctrl
      const write = (t, extra = {}) =>
        setMessages((m) => {
          const i = m.findIndex((x) => x.id === botId)
          if (i < 0) return [...m, { id: botId, role: "bot", text: t, ...extra }]
          const next = m.slice()
          next[i] = { ...next[i], text: t, ...extra }
          return next
        })
      try {
        const reply = await ChatEngine(msg, { signal: ctrl.signal, onText: (t) => write(t, { live: true }) })
        write(reply, { live: false })
      } catch {
        if (ctrl.signal.aborted) {
          setMessages((m) => m.map((x) => (x.id === botId ? { ...x, live: false, text: x.text ? `${x.text} …` : "Stopped." } : x)))
        } else {
          write(FAIL, { live: false })
        }
      } finally {
        abortRef.current = null
        setBusy(false)
        inputRef.current?.focus()
      }
    },
    [input, busy],
  )

  const stop = () => abortRef.current?.abort()

  const newChat = () => {
    abortRef.current?.abort()
    resetChat()
    setMessages(fresh())
    setInput("")
    inputRef.current?.focus()
  }

  const waiting = busy && !messages.some((m) => m.live)

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
              <div className="chat-id">
                <span className="chat-avatar" aria-hidden="true">
                  G<span>.</span>
                </span>
                <div>
                  <p id="chat-title" className="chat-title">
                    Ask about Ganesh
                  </p>
                  <p className="chat-sub">
                    <span className={`chat-live${isConfigured ? "" : " is-off"}`} aria-hidden="true" />
                    {isConfigured ? "Gemini · grounded in his portfolio" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="chat-actions">
                {messages.length > 1 && (
                  <button type="button" className="chat-icon" onClick={newChat} aria-label="Start a new chat" title="New chat">
                    <Icon name="replay" size={16} />
                  </button>
                )}
                <button type="button" className="chat-icon" onClick={onClose} aria-label="Close assistant">
                  <Icon name="close" size={18} />
                </button>
              </div>
            </header>

            <div className="chat-body" ref={bodyRef} aria-live="polite">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  className={`msg msg--${m.role}${m.live ? " is-live" : ""}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: ease.out }}
                >
                  {m.role === "bot" ? <Markdown content={m.text} /> : m.text}
                </motion.div>
              ))}
              {waiting && (
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
                if (busy) stop()
                else send()
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
                maxLength={500}
                placeholder={busy ? "Thinking…" : "Ask anything about Ganesh…"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {busy ? (
                <button type="submit" className="is-stop" aria-label="Stop the reply">
                  <Icon name="stop" size={16} />
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()} aria-label="Send question">
                  <Icon name="send" size={18} />
                </button>
              )}
            </form>
            <p className="chat-note">AI can slip. For anything important, email Ganesh.</p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
