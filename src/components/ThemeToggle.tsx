import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-indigo-700 dark:to-indigo-900 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div
        className={`absolute top-1 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center
          ${isDarkMode ? 'translate-x-[22px] bg-gray-700' : 'translate-x-[4px] bg-yellow-500'}
        `}
      >
        {isDarkMode ? (
          <Sun className="w-4 h-4 text-white" />
        ) : (
          <Moon className="w-4 h-4 text-white" />
        )}
      </div>
    </button>
  );
};
