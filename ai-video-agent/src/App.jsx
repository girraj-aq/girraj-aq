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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveApiKey = () => {
    localStorage.setItem('anthropic_key', apiKey)
    setShowKeyInput(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    if (!apiKey.trim()) {
      setShowKeyInput(true)
      return
    }

    const userMessage = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
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
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error?.message || `API error: ${res.status}`)
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
          content: `Error: ${err.message}`,
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
      {/* API Key Modal */}
      {showKeyInput && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-lg font-bold mb-2">Enter Anthropic API Key</h3>
            <p className="text-sm text-gray-400 mb-4">
              Your key is stored locally in your browser only. Get one from{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline"
              >
                console.anthropic.com
              </a>
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={saveApiKey}
                disabled={!apiKey.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white py-2 rounded-lg font-semibold"
              >
                Save Key
              </button>
              <button
                onClick={() => setShowKeyInput(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎬</div>
            <div>
              <h1 className="text-xl font-bold">AI Video Agent</h1>
              <p className="text-sm text-gray-400">
                Your AI-powered video content assistant
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowKeyInput(true)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              apiKey
                ? 'border-green-700 text-green-400 hover:bg-green-900/30'
                : 'border-red-700 text-red-400 hover:bg-red-900/30'
            }`}
          >
            {apiKey ? 'Key Set' : 'Set API Key'}
          </button>
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
              {!apiKey && (
                <div className="mb-8 p-4 bg-yellow-900/30 border border-yellow-700 rounded-xl max-w-md mx-auto">
                  <p className="text-yellow-300 text-sm">
                    Please set your Anthropic API key first by clicking "Set API Key" button above.
                  </p>
                </div>
              )}
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
