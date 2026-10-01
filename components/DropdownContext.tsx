'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type DropdownCtx = {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
};

const DropdownContext = createContext<DropdownCtx>({
  activeId: null,
  setActiveId: () => {},
});

/**
 * Wraps a group of dropdowns (e.g. language + theme) so that only one
 * can be open at a time. Opening one closes the others, which prevents
 * the two menus from overlapping when both are clicked.
 */
export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  return (
    <DropdownContext.Provider value={{ activeId, setActiveId }}>
      {children}
    </DropdownContext.Provider>
  );
};

/**
 * Hook for a single dropdown. Attach `btnRef` to the Menu.Button.
 *
 * Headless UI v1.7 does not expose a controlled `open`/`onClose` on
 * <Menu>, so we observe the button's `aria-expanded` attribute (which
 * Headless UI keeps in sync with the open state) to:
 *   - claim "active" when this menu opens (closing any other dropdown)
 *   - release "active" when this menu closes
 *   - close ourselves when a *different* dropdown becomes active
 */
export const useDropdown = (id: string, ready = true) => {
  const { activeId, setActiveId } = useContext(DropdownContext);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Keep activeId in sync with this menu's real open state.
  // `ready` re-runs the effect once the button is actually in the DOM
  // (components render a placeholder until mounted).
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const observer = new MutationObserver(() => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      if (open) {
        setActiveId(id);
      } else if (activeId === id) {
        setActiveId(null);
      }
    });
    observer.observe(btn, {
      attributes: true,
      attributeFilter: ['aria-expanded'],
    });
    return () => observer.disconnect();
  }, [id, activeId, setActiveId, ready]);

  // Close ourselves when a different dropdown opens.
  useEffect(() => {
    if (activeId !== null && activeId !== id) {
      const btn = btnRef.current;
      if (btn && btn.getAttribute('aria-expanded') === 'true') {
        btn.click();
      }
    }
  }, [activeId, id]);

  return { btnRef };
};
