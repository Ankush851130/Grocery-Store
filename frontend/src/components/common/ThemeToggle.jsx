import { FaMoon, FaSun } from 'react-icons/fa6';
import { useTheme } from '../../context/ThemeContext';

function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center gap-2 rounded-full p-2.5 text-sm font-semibold transition-all duration-300 ${
        isDark
          ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-slate-700'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
      } ${className}`}
    >
      <span className="flex h-5 w-5 items-center justify-center transition-transform duration-500 transform rotate-0 dark:rotate-[360deg]">
        {isDark ? <FaSun className="text-base text-amber-300" /> : <FaMoon className="text-base text-slate-700" />}
      </span>
      <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}

export default ThemeToggle;
