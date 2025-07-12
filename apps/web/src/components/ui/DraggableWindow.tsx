import React, { useRef, useState } from 'react';

interface DraggableWindowProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  height?: number;
}

const MIN_WIDTH = 350;
const MIN_HEIGHT = 400;

export const DraggableWindow: React.FC<DraggableWindowProps> = ({
  title = 'LLM Chat',
  onClose,
  children,
  width = 400,
  height = 500,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - width / 2,
    y: window.innerHeight / 2 - height / 2,
  });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current && e.button === 0) {
      setDragging(true);
      setRel({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      e.preventDefault();
    }
  };

  const onMouseUp = () => setDragging(false);

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - width, e.clientX - rel.x)),
      y: Math.max(0, Math.min(window.innerHeight - height, e.clientY - rel.y)),
    });
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line
  }, [dragging]);

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: Math.max(width, MIN_WIDTH),
        height: Math.max(height, MIN_HEIGHT),
        zIndex: 1000,
        background: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
      }}
    >
      <div
        style={{
          cursor: 'move',
          padding: '0.75rem 1rem',
          background: '#f3f4f6',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
        onMouseDown={onMouseDown}
      >
        <span style={{ fontWeight: 600 }}>{title}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: '#888',
            marginLeft: 8,
          }}
          aria-label="Close LLM Chat"
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
        {children}
      </div>
    </div>
  );
}; 