import { useEffect, useRef } from 'react';

const STYLES = {
  success: {
    bg:     '#166534',
    border: '#15803d',
    icon:   (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  error: {
    bg:     '#991b1b',
    border: '#b91c1c',
    icon:   (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  info: {
    bg:     '#1e40af',
    border: '#1d4ed8',
    icon:   (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};

const Toast = ({ toast, onClose, duration = 2000 }) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onClose, duration);
    return () => clearTimeout(timerRef.current);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const style = STYLES[toast.type] ?? STYLES.info;

  return (
    <div
      style={{
        position:     'fixed',
        top:          20,
        right:        20,
        zIndex:       9999,
        display:      'flex',
        alignItems:   'center',
        gap:          10,
        padding:      '12px 16px',
        borderRadius: 8,
        background:   style.bg,
        border:       `1px solid ${style.border}`,
        color:        '#fff',
        fontSize:     14,
        fontWeight:   500,
        boxShadow:    '0 4px 16px rgba(0,0,0,0.25)',
        maxWidth:     360,
        minWidth:     220,
        animation:    'toast-in 0.2s ease',
      }}
    >
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
      <span style={{ flexShrink: 0 }}>{style.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border:     'none',
          color:      'rgba(255,255,255,0.7)',
          cursor:     'pointer',
          padding:    '0 2px',
          fontSize:   18,
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
