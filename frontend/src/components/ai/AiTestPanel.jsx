import { useState, useRef } from 'react';

/**
 * AiTestPanel — Phase 1 only.
 * Fixed to the right side of the screen as a collapsible floating panel.
 * Will be replaced by the full AskPanel in Phase 4.
 */
const AiTestPanel = ({ token }) => {
  const [prompt, setPrompt]     = useState('');
  const [output, setOutput]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [isOpen, setIsOpen]     = useState(false); // collapsed by default
  const outputRef               = useRef(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleStream = async () => {
    if (!prompt.trim()) return;
    setOutput('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/ai/test-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Server error');
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
            } else if (parsed.text) {
              setOutput(prev => prev + parsed.text);
            }
          } catch {
            // partial chunk — skip
          }
        }

        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fixed floating container on the right */}
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

        {/* Toggle tab — always visible */}
        <button
          onClick={() => setIsOpen(o => !o)}
          title={isOpen ? 'Close AI Panel' : 'Open AI Panel'}
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            background: 'linear-gradient(180deg, #8b5cf6, #6366f1)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px 0 0 10px',
            padding: '1rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '-2px 0 16px rgba(139,92,246,0.35)',
            transition: 'opacity 0.2s',
          }}
        >
          AI Test
        </button>

        {/* Sliding panel */}
        <div style={{
          width: isOpen ? '300px' : '0px',
          overflow: 'hidden',
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <div style={{
            width: '300px',
            background: 'rgba(15, 10, 30, 0.92)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(139,92,246,0.3)',
            borderTop: '1px solid rgba(139,92,246,0.3)',
            borderBottom: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '12px 0 0 12px',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: '-4px 0 30px rgba(139,92,246,0.15)',
            maxHeight: '80vh',
          }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                 Synapse AI
              </span>
              {/* "In Development" badge */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(234,179,8,0.12)',
                border: '1px solid rgba(234,179,8,0.35)',
                borderRadius: '20px',
                padding: '0.15rem 0.6rem',
                fontSize: '0.67rem',
                fontWeight: '600',
                color: '#fbbf24',
                letterSpacing: '0.04em',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', display: 'inline-block', animation: 'aipulse 1.5s ease-in-out infinite' }} />
                IN DEVELOPMENT
              </span>
            </div>

            {/* Prompt textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type a prompt to test Gemini streaming..."
              rows={3}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#fff',
                padding: '0.6rem 0.8rem',
                fontSize: '0.82rem',
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none',
                lineHeight: '1.5',
              }}
            />

            {/* Send button */}
            <button
              onClick={handleStream}
              disabled={loading || !prompt.trim()}
              style={{
                background: loading || !prompt.trim()
                  ? 'rgba(139,92,246,0.3)'
                  : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Streaming...
                </>
              ) : 'Send'}
            </button>

            {/* Error */}
            {error && (
              <p style={{ color: '#f87171', fontSize: '0.78rem', margin: 0 }}>⚠ {error}</p>
            )}

            {/* Output */}
            {output && (
              <div
                ref={outputRef}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  color: '#e2e8f0',
                  fontSize: '0.8rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {output}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes aipulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </>
  );
};

export default AiTestPanel;
