import { useEffect, useRef, useCallback } from 'react';

const WARN_AFTER_MS   = 13 * 60 * 1000;
const LOGOUT_AFTER_MS = 15 * 60 * 1000;

export const useInactivityTimeout = ({ onWarn, onLogout }) => {
  const warnTimer   = useRef(null);
  const logoutTimer = useRef(null);

  const clearAll = useCallback(() => {
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);
  }, []);

  const reset = useCallback(() => {
    clearAll();
    warnTimer.current   = setTimeout(onWarn,   WARN_AFTER_MS);
    logoutTimer.current = setTimeout(onLogout, LOGOUT_AFTER_MS);
  }, [clearAll, onWarn, onLogout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearAll();
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [reset, clearAll]);
};
