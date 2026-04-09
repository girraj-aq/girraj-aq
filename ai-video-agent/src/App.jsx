import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `You are an AI Video Agent. You help users with:
1. Video script writing - Create engaging scripts for YouTube, TikTok, Reels, etc.
2. Video idea generation - Suggest trending and creative video topics.
3. SEO optimization - Titles, descriptions, tags, and thumbnails suggestions.
4. Content planning - Weekly/monthly content calendars.
5. Video editing tips - Transitions, effects, pacing advice.
6. Audience growth strategies - Engagement tactics and analytics insights.

Always be creative, concise, and actionable. Format responses with clear headings and bullet points when appropriate.`

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()
      const assistantText =
        data.content?.[0]?.text || 'Sorry, no response received.'

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantText },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message}. Make sure your API key is set in .env and the dev server is running.`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickPrompts = [
    'Give me 5 viral YouTube video ideas for tech niche',
    'Write a 60-second Instagram Reel script about AI',
    'Create a weekly content calendar for a cooking channel',
    'Suggest SEO-optimized title and tags for a travel vlog',
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="text-3xl">🎬</div>
          <div>
            <h1 className="text-xl font-bold">AI Video Agent</h1>
            <p className="text-sm text-gray-400">
              Your AI-powered video content assistant
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome to AI Video Agent
              </h2>
              <p className="text-gray-400 mb-8">
                I can help you create scripts, plan content, optimize SEO, and
                grow your video channel.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt)
                    }}
                    className="text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors border border-gray-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <div className="text-xs font-semibold mb-1 opacity-70">
                  {msg.role === 'user' ? 'You' : 'AI Agent'}
                </div>
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <div className="text-xs font-semibold mb-1 opacity-70">
                  AI Agent
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about video ideas, scripts, SEO, content planning..."
            rows={1}
            className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          Powered by Claude API | AI Video Agent v1.0
        </p>
      </footer>
    </div>
  )
}

export default App
