"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { TutorialPage } from "@/config/tutorial-steps";

type TutorialContextValue = {
  /** Which page tutorial is currently running (null = none) */
  activePage: TutorialPage | null;
  /** True when any tutorial tour is actively displayed */
  isTutorialActive: boolean;
  /** Called by TutorialProvider when the tour starts */
  setActivePage: (page: TutorialPage | null) => void;
};

const TutorialContext = createContext<TutorialContextValue>({
  activePage: null,
  isTutorialActive: false,
  setActivePage: () => {},
});

export function TutorialContextProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePageState] = useState<TutorialPage | null>(null);

  const setActivePage = useCallback((page: TutorialPage | null) => {
    setActivePageState(page);
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        activePage,
        isTutorialActive: activePage !== null,
        setActivePage,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorialContext() {
  return useContext(TutorialContext);
}
