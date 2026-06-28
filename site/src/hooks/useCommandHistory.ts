import { useState, useCallback } from 'react';

export function useCommandHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback((command: string) => {
    if (command.trim()) {
      setHistory(prev => [...prev, command]);
    }
  }, []);

  const navigateHistory = useCallback((direction: 'up' | 'down'): string | undefined => {
    if (history.length === 0) return undefined;

    let newIndex: number;

    if (direction === 'up') {
      newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
    } else {
      newIndex = historyIndex === -1 ? -1 : Math.min(history.length - 1, historyIndex + 1);
      if (historyIndex === history.length - 1) {
        setHistoryIndex(-1);
        return '';
      }
    }

    setHistoryIndex(newIndex);
    return history[newIndex];
  }, [history, historyIndex]);

  const resetNavigation = useCallback(() => {
    setHistoryIndex(-1);
  }, []);

  return {
    history,
    addToHistory,
    navigateHistory,
    resetNavigation,
  };
}
