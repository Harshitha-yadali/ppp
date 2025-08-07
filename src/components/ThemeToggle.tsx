import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-6 bg-primary-200 dark:bg-dark-400 rounded-full shadow-inner transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-dark-100"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
          isDarkMode ? 'translate-x-6 bg-neon-cyan-500' : 'translate-x-0 bg-primary-600'
        }`}
      >
        {isDarkMode ? (
          <Moon className="w-3 h-3 text-white" />
        ) : (
          <Sun className="w-3 h-3 text-white" />
        )}
      </div>
    </button>
  );
};
