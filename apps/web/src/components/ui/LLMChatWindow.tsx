import React, { useState, useRef } from 'react';
import { sendPromptStream } from '../../utils/llm';

export const LLMChatWindow: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    setResponse('');
    setLoading(true);
    await sendPromptStream({
      prompt,
      onChunk: (chunk) => {
        setResponse((prev) => prev + chunk);
        // Auto-scroll to bottom
        setTimeout(() => {
          responseRef.current?.scrollTo({ top: responseRef.current.scrollHeight, behavior: 'smooth' });
        }, 0);
      },
    });
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={responseRef} className="flex-1 overflow-y-auto bg-gray-50 p-3 rounded mb-2" style={{ minHeight: 200 }}>
        <pre className="whitespace-pre-wrap text-sm text-gray-800">{response}</pre>
      </div>
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={3}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Type your prompt..."
        disabled={loading}
      />
      <button
        className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange"
        onClick={handleSend}
        disabled={loading || !prompt.trim()}
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}; 