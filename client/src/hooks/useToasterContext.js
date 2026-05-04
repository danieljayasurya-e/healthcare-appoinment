import { useContext } from 'react';
import { ToasterContext } from '../context/ToasterContext';

/**
 * Convenience hook for consuming the ToasterContext.
 *
 * Usage:
 *   const { addToast } = useToasterContext();
 *   addToast('Saved!', 'success');
 */
export const useToasterContext = () => {
  const ctx = useContext(ToasterContext);

  if (!ctx) {
    throw new Error('useToasterContext must be used inside <ToasterProvider>');
  }

  return ctx;
};
