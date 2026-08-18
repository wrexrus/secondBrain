import { useState, useRef } from 'react';
import { Sparkles,Lock } from 'lucide-react';

const AskPanel = ({ token, onCategoryClick }) => {
  const [question, setQuestion]   = useState('');
  const [answer, setAnswer]       = useState('');
  const [sources, setSources]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]       = useState('');
  const [isOpen, setIsOpen]       = useState(false);
  
  const answerRef                 = useRef(null);
  const abortControllerRef        = useRef(null); // Ref to manage active fetch request signal

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleAsk = async (promptToUse) => {
    const queryText = promptToUse || question;
    if (!queryText.trim() || loading) return;

    // Abort any existing active request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setAnswer('');
    setSources([]);
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: queryText }),
        signal: controller.signal // Wire signal for request cancellation
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Server error starting AI search.');
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split('\n\n').filter(Boolean);

        for (const line of lines) {
          const data = line.replace(/^data:\s*/, '').trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              setError(parsed.error);
            }
            // Display source citations as soon as they are received from backend
            if (parsed.sources) {
              setSources(parsed.sources);
            }
            // Append streaming tokens to the answer
            if (parsed.text) {
              setAnswer(prev => prev + parsed.text);
            }
          } catch {
            // ignore partial json chunk fragments
          }
        }

        if (answerRef.current) {
          answerRef.current.scrollTop = answerRef.current.scrollHeight;
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Handled cleanly when user clicks "Stop Query"
        console.log('[AI Query Aborted]');
      } else {
        setError('Network error: ' + err.message);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Stop running stream query
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  };

  // Clear answer and sources
  const handleClear = () => {
    handleStop();
    setAnswer('');
    setSources([]);
    setError('');
  };

  return (
    <>
      {/* Fixed floating container on the right side */}
      <div style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0,
      }}>

        {/* Vertical Trigger Button */}
        <button
          onClick={() => setIsOpen(o => !o)}
          title={isOpen ? 'Close AI Assistant' : 'Ask your Second Brain'}
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            background: 'linear-gradient(180deg, #8b5cf6, #6366f1)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px 0 0 12px',
            padding: '1.2rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: '700',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '-3px 0 20px rgba(139,92,246,0.4)',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
          }}
        >
          <span style={{ fontSize: '1rem' }}><Sparkles size={15}/></span>
          Ask AI
        </button>

        {/* Sliding Panel Container */}
        <div style={{
          width: isOpen ? '360px' : '0px',
          overflow: 'hidden',
          transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{
            width: '360px',
            background: 'rgba(15, 10, 30, 0.94)',
            backdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(139,92,246,0.3)',
            borderTop: '1px solid rgba(139,92,246,0.3)',
            borderBottom: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '16px 0 0 16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '-6px 0 35px rgba(0,0,0,0.5)',
            maxHeight: '85vh',
            boxSizing: 'border-box'
          }}>

            {/* Panel Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}>
                  <span style={{ color: '#a78bfa' }}><Sparkles size={17}/></span> Ask Your Second Brain
                </h3>
                {/* Clear Privacy Boundary Notice */}
                <p style={{ color: 'var(--text-muted, #a1a1aa)', fontSize: '0.73rem', margin: '0.3rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ color: '#10b981', fontSize: '0.7rem' }}><Lock size={15}/></span>
                  Only searches items marked <strong>AI-enabled</strong>
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Input area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder="Ask anything about your saved notes, links, or media..."
                rows={3}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: '10px',
                  color: '#fff',
                  padding: '0.7rem 0.85rem',
                  fontSize: '0.85rem',
                  resize: 'none',
                  fontFamily: 'inherit',
                  outline: 'none',
                  lineHeight: '1.5',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              />

              {/* Action Controls: Ask vs Stop */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!loading ? (
                  <button
                    onClick={() => handleAsk()}
                    disabled={!question.trim()}
                    style={{
                      flex: 1,
                      background: !question.trim()
                        ? 'rgba(139,92,246,0.3)'
                        : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.65rem',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: !question.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'background 0.2s',
                    }}
                  >
                    <span><Sparkles size={15}/></span> Ask Question
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    style={{
                      flex: 1,
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      color: '#f87171',
                      borderRadius: '10px',
                      padding: '0.65rem',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f87171', display: 'inline-block' }} />
                    Stop Generation
                  </button>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                color: '#f87171',
                fontSize: '0.78rem'
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Answer Display Container */}
            {(answer || loading) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>✦</span> Answer {loading && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(generating...)</span>}
                  </span>
                  
                  {/* Clear / Close Response Button */}
                  <button
                    onClick={handleClear}
                    title="Clear response"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: 'none',
                      color: '#94a3b8',
                      borderRadius: '4px',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                  >
                    Clear
                  </button>
                </div>

                <div
                  ref={answerRef}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    color: '#e2e8f0',
                    fontSize: '0.83rem',
                    lineHeight: '1.65',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {answer || (
                    <span style={{ color: 'var(--text-muted, #a1a1aa)', fontStyle: 'italic' }}>
                      Synthesizing response from your saved content...
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Sources / Citations list */}
            {sources.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted, #a1a1aa)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Sources Cited ({sources.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '110px', overflowY: 'auto' }}>
                  {sources.map((src, idx) => (
                    <div
                      key={src.id || idx}
                      onClick={() => {
                        if (src.category && onCategoryClick) {
                          onCategoryClick(src.category);
                        }
                      }}
                      style={{
                        background: 'rgba(139,92,246,0.1)',
                        border: '1px solid rgba(139,92,246,0.25)',
                        borderRadius: '6px',
                        padding: '0.4rem 0.6rem',
                        cursor: src.category ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: '#d8b4fe',
                        transition: 'background 0.2s ease'
                      }}
                      title="Click to view category"
                    >
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        📁 <strong>{src.category}:</strong> {src.content || src.url || 'Saved item'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#a78bfa' }}>View →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default AskPanel;
