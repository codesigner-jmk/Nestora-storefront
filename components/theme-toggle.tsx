"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("nestora-theme", nextTheme);
    setTheme(nextTheme);
  }

  return <button
    className="theme-switch"
    type="button"
    role="switch"
    aria-label="Dark mode"
    aria-checked={theme === "dark"}
    title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    onClick={toggleTheme}
  >
    <span className="theme-switch-thumb" aria-hidden="true">
      {theme === "dark"
        ? <svg viewBox="0 0 24 24"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" /></svg>
        : <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>}
    </span>
  </button>;
}
