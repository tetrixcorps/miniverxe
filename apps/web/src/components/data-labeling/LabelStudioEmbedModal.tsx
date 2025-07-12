import React, { useEffect, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import LabelStudioEmbed from './LabelStudioEmbed';
import { Button } from '../../components/ui/button';

interface LabelStudioEmbedModalProps {
  iframeUrl: string;
  height?: string | number;
  width?: string | number;
  token?: string;
  readOnly?: boolean;
  projectName?: string;
  taskTitle?: string;
  dueDate?: string;
  onComplete?: () => void;
}

const LabelStudioEmbedModal = NiceModal.create((props: LabelStudioEmbedModalProps) => {
  const modal = useModal();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timeout for annotation complete event
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (iframeLoaded) {
      timeout = setTimeout(() => {
        setError('Annotation not completed in time. Please try again or check your connection.');
      }, 10 * 60 * 1000); // 10 minutes
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [iframeLoaded]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const allowedOrigin = new URL(props.iframeUrl).origin;
      if (event.origin !== allowedOrigin) return;
      if (event.data && event.data.type === 'label-studio:annotation-complete') {
        if (props.onComplete) props.onComplete();
        modal.hide();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [props.iframeUrl, props.onComplete, modal]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${modal.visible ? '' : 'hidden'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="label-studio-modal-title"
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <div className="mb-4">
          <h2 id="label-studio-modal-title" className="text-xl font-bold">
            Label Studio
          </h2>
          {props.projectName && (
            <div className="text-gray-700 text-sm mt-1">
              <span className="font-semibold">Project:</span> {props.projectName}
            </div>
          )}
          {props.taskTitle && (
            <div className="text-gray-700 text-sm mt-1">
              <span className="font-semibold">Task:</span> {props.taskTitle}
            </div>
          )}
          {props.dueDate && (
            <div className="text-gray-700 text-sm mt-1">
              <span className="font-semibold">Due:</span> {props.dueDate}
            </div>
          )}
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-2 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}
        <iframe
          src={props.iframeUrl}
          onLoad={() => setIframeLoaded(true)}
          onError={() => setError('Failed to load Label Studio.')}
          style={{ width: props.width || '100%', height: props.height || 600, border: 'none' }}
          title="Label Studio"
        />
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => modal.hide()}>Close</Button>
        </div>
      </div>
    </div>
  );
});

export default LabelStudioEmbedModal; 