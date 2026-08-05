import { useState, useCallback, useRef } from "react";

export function useHistory<T>(initialState: T, maxHistory: number = 50) {
  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [pointer, setPointer] = useState<number>(0);

  // Use a ref to track if we're currently time-traveling, 
  // so we don't accidentally push states we just undid/redid.
  const isTimeTraveling = useRef(false);

  const setWithHistory = useCallback(
    (newStateOrUpdater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const nextState =
          typeof newStateOrUpdater === "function"
            ? (newStateOrUpdater as (prev: T) => T)(prev)
            : newStateOrUpdater;

        // Skip if nothing changed (optional, but good for performance)
        if (JSON.stringify(prev) === JSON.stringify(nextState)) {
          return prev;
        }

        if (!isTimeTraveling.current) {
          setHistory((prevHistory) => {
            // Cut off future history if we're in the past and make a new change
            const currentHistory = prevHistory.slice(0, pointer + 1);
            const newHistory = [...currentHistory, nextState];
            
            // Trim if we exceed max history
            if (newHistory.length > maxHistory) {
              newHistory.shift();
            }
            
            setPointer(newHistory.length - 1);
            return newHistory;
          });
        }
        
        isTimeTraveling.current = false;
        return nextState;
      });
    },
    [pointer, maxHistory]
  );

  const undo = useCallback(() => {
    if (pointer > 0) {
      isTimeTraveling.current = true;
      setPointer((prev) => prev - 1);
      setState(history[pointer - 1]);
    }
  }, [pointer, history]);

  const redo = useCallback(() => {
    if (pointer < history.length - 1) {
      isTimeTraveling.current = true;
      setPointer((prev) => prev + 1);
      setState(history[pointer + 1]);
    }
  }, [pointer, history]);

  return [state, setWithHistory, { undo, redo, canUndo: pointer > 0, canRedo: pointer < history.length - 1 }] as const;
}
