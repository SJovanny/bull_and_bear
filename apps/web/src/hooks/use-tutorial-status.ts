"use client";

import { useEffect, useState } from "react";

type TutorialsCompleted = Record<string, boolean>;

export function useTutorialStatus() {
  const [tutorialsCompleted, setTutorialsCompleted] = useState<TutorialsCompleted>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/me/tutorial");
        if (res.ok) {
          const data = await res.json();
          setTutorialsCompleted(data.tutorialsCompleted ?? {});
        }
      } catch {
        // Silent fail
      } finally {
        setLoaded(true);
      }
    }

    load();
  }, []);

  return { tutorialsCompleted, loaded };
}
