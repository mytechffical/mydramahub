"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("dh-theme", next); } catch {}
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}>
      {theme === "light" ? (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79Z" />
        </svg>
      )}
    </button>
  );
}
