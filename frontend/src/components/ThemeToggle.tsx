import { useTheme, type ThemeMode } from "../context/ThemeContext";

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 18v3" />
    </svg>
  );
}

function getIcon(theme: ThemeMode) {
  if (theme === "light") {
    return <SunIcon />;
  }

  if (theme === "dark") {
    return <MoonIcon />;
  }

  return <MonitorIcon />;
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <button
        type="button"
        className={`theme-toggle-option ${
          theme === "light" ? "theme-toggle-option-active" : ""
        }`}
        onClick={() => setTheme("light")}
        title="Light theme"
        aria-label="Use light theme"
        aria-pressed={theme === "light"}
      >
        <SunIcon />
        <span>Light</span>
      </button>

      <button
        type="button"
        className={`theme-toggle-option ${
          theme === "dark" ? "theme-toggle-option-active" : ""
        }`}
        onClick={() => setTheme("dark")}
        title="Dark theme"
        aria-label="Use dark theme"
        aria-pressed={theme === "dark"}
      >
        <MoonIcon />
        <span>Dark</span>
      </button>

      <button
        type="button"
        className={`theme-toggle-option ${
          theme === "system" ? "theme-toggle-option-active" : ""
        }`}
        onClick={() => setTheme("system")}
        title="Use system theme"
        aria-label="Use system theme"
        aria-pressed={theme === "system"}
      >
        <MonitorIcon />
        <span>System</span>
      </button>

      <div className="theme-toggle-current" aria-hidden="true">
        {getIcon(theme)}
      </div>
    </div>
  );
}