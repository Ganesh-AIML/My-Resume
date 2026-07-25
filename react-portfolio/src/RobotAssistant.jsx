import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { ChatEngine } from "./chatService"

const LOTTIE_URL =
  "https://assets-v2.lottiefiles.com/a/98a5f1ec-1164-11ee-b120-e331a2c2ea3f/EpJTjpZSlN.json"

function formatResponse(text) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p
    )
    if (line.trim() === "") return <br key={i} />
    if (line.startsWith("- ")) return <li key={i} style={{ marginBottom: 6, listStyle: "none" }}>{parts}</li>
    return <p key={i} style={{ margin: "4px 0" }}>{parts}</p>
  })
}

function TypingDots() {
  return (
    <div className="typing-dots">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  )
}

export default function RobotAssistant() {
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState("")
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, isTyping])

  useEffect(() => {
    if (chatOpen && inputRef.current) inputRef.current.focus()
  }, [chatOpen])

  const addBotMessage = useCallback((text) => {
    setIsTyping(false)
    setMessages((prev) => [...prev, { role: "bot", text }])
  }, [])

  const handleSend = useCallback(async (text) => {
    const msg = text || input
    if (!msg.trim() || isTyping) return
    setMessages((prev) => [...prev, { role: "user", text: msg }])
    setInput("")
    setIsTyping(true)
    try {
      const res = await ChatEngine(msg)
      addBotMessage(res)
    } catch {
      addBotMessage("Sorry, I'm having trouble connecting. Please try again later!")
    }
  }, [input, isTyping, addBotMessage])

  const openChat = () => {
    setChatOpen(true)
    if (messages.length === 0) {
      setIsTyping(true)
      setTimeout(() => addBotMessage("Hey there! I'm here to help you learn about Ganesh. Ask me anything!"), 1000)
    }
  }

  return (
    <>
      <motion.div
        className="robot-fab"
        style={{ position: "fixed", bottom: 0, right: 0 }}
        onClick={openChat}
      >
        <DotLottieReact
          src={LOTTIE_URL}
          autoplay
          loop
          width={100}
          height={100}
          speed={0.4}
          renderConfig={{ devicePixelRatio: 2 }}
          layout={{ fit: "contain", align: [1, 1] }}
        />
      </motion.div>

      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div className="chat-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChatOpen(false)} />
            <motion.aside
              className="chat-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className="chat-avatar">
                    <DotLottieReact src={LOTTIE_URL} autoplay loop speed={0.6} layout={{ fit: "contain", align: [0.5, 0.65] }} />
                  </div>
                  <div>
                    <p className="chat-title">Assistant</p>
                    <p className="chat-status">Online</p>
                    <p className="chat-ai-notice">AI — may be inaccurate</p>
                  </div>
                </div>
                <button className="chat-close" onClick={() => setChatOpen(false)}><i className="fas fa-times" /></button>
              </div>

              <div className="chat-body" ref={bodyRef}>
                {messages.map((msg, i) => (
                  <div key={i} className={`chat-message ${msg.role}`}>
                    {msg.role === "bot" && (
                      <div className="msg-avatar">
                        <DotLottieReact src={LOTTIE_URL} autoplay loop speed={0.6} layout={{ fit: "contain", align: [0.5, 0.65] }} />
                      </div>
                    )}
                    <div className="msg-bubble">{formatResponse(msg.text)}</div>
                  </div>
                ))}
                {isTyping && (
                  <div className="chat-message bot">
                    <div className="msg-avatar">
                      <DotLottieReact src={LOTTIE_URL} autoplay loop speed={0.6} layout={{ fit: "contain", align: [0.5, 0.65] }} />
                    </div>
                    <div className="msg-bubble"><TypingDots /></div>
                  </div>
                )}
              </div>

              <div className="chat-footer">
                <input ref={inputRef} type="text" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} disabled={isTyping} />
                <button className="chat-send" onClick={() => handleSend()} disabled={!input.trim() || isTyping}><i className="fas fa-paper-plane" /></button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
