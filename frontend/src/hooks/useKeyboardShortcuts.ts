import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ShortcutOptions {
  onOpenHelp?: () => void;
  onCloseAll?: () => void;
}

export const useKeyboardShortcuts = (options: ShortcutOptions = {}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const lastKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Ignore if typing in input/textarea
      const activeElement = document.activeElement;
      const isInput = 
        activeElement instanceof HTMLInputElement || 
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;
      
      if (isInput) return;

      const key = event.key.toLowerCase();

      // 2. Clear sequence timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // 3. Simple Single Keys
      if (key === '?' || (event.shiftKey && event.key === '?')) {
        event.preventDefault();
        options.onOpenHelp?.();
        return;
      }

      if (key === 'escape') {
        options.onCloseAll?.();
        return;
      }

      // 4. Sequence Handling ('G' sequence)
      if (lastKeyRef.current === 'g') {
        const role = user?.role || 'student';
        let handled = true;

        switch (key) {
          case 'd': navigate(`/${role}/dashboard`); break;
          case 'j': navigate(`/${role}/jobs`); break;
          case 'a': navigate(role === 'student' ? '/student/applications' : `/${role}/dashboard`); break;
          case 'p': navigate(`/${role}/profile`); break;
          case 's': navigate(`/${role}/settings`); break;
          case 'n': navigate(`/${role}/notifications`); break;
          case 'c': navigate(`/${role}/chat`); break;
          default: handled = false; break;
        }

        if (handled) {
          event.preventDefault();
          lastKeyRef.current = null;
          return;
        }
      }

      // 5. Start Sequence
      if (key === 'g') {
        lastKeyRef.current = 'g';
        timeoutRef.current = setTimeout(() => {
          lastKeyRef.current = null;
        }, 500); // 500ms window for sequence
        return;
      }

      // Reset last key if it wasn't used in a sequence
      lastKeyRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [navigate, user, options]);
};
