import React, { useState } from 'react';

interface LabelStudioEmbedProps {
  iframeUrl: string;
  height?: string | number;
  width?: string | number;
  token?: string;
  readOnly?: boolean;
}

const LabelStudioEmbed: React.FC<LabelStudioEmbedProps> = ({
  iframeUrl,
  height = 600,
  width = '100%',
  token,
  readOnly = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compose the src URL with token/readOnly if needed
  let src = iframeUrl;
  const params = new URLSearchParams();
  if (token) params.append('token', token);
  if (readOnly) params.append('readOnly', 'true');
  if (params.toString()) {
    src += (iframeUrl.includes('?') ? '&' : '?') + params.toString();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] border rounded bg-gray-50 p-4 w-full">
      {loading && !error && (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <span className="text-gray-500">Loading Label Studio...</span>
        </div>
      )}
      {error && (
        <div className="text-red-600 text-center">
          <p>Failed to load Label Studio.</p>
          <p className="text-xs">{error}</p>
        </div>
      )}
      <iframe
        src={src}
        title="Label Studio"
        width={width}
        height={height}
        style={{ display: loading || error ? 'none' : 'block', border: 'none', borderRadius: 8 }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError('Could not load the Label Studio instance.');
        }}
        allowFullScreen
      />
    </div>
  );
};

export default LabelStudioEmbed; 