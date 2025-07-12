export async function sendPromptStream({ prompt, model = 'llama2', onChunk }: {
  prompt: string;
  model?: string;
  onChunk: (chunk: string) => void;
}) {
  const res = await fetch('/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: true }),
  });
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) onChunk(decoder.decode(value));
  }
} 