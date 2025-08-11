import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      className="group relative inline-flex w-14 h-8 items-center rounded-full p-1 transition-[background] duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 bg-gradient-to-r from-amber-400 to-amber-500 dark:from-indigo-600 dark:to-indigo-800"
    >
      <span
        className={`relative h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-300 ease-out group-active:scale-95 ${
          isDarkMode ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {isDarkMode ? (
          <Sun className="absolute inset-0 m-auto h-4 w-4 text-amber-500" />
        ) : (
          <Moon className="absolute inset-0 m-auto h-4 w-4 text-indigo-600" />
        )}
      </span>
    </button>
  );
};
