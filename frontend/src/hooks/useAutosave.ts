import { useEffect } from 'react';

export const useAutosave = (key: string, data: any, callback: (savedData: any) => void) => {
  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(`pms-autosave-${key}`);
    if (saved) {
      try {
        callback(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse autosave data', err);
      }
    }
  }, []);

  // Save data on change
  useEffect(() => {
    if (data && Object.values(data).some(val => val !== '' && val !== null)) {
      localStorage.setItem(`pms-autosave-${key}`, JSON.stringify(data));
    }
  }, [data, key]);

  // Clear autosave
  const clearAutosave = () => {
    localStorage.removeItem(`pms-autosave-${key}`);
  };

  return { clearAutosave };
};
