import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 flex items-center rounded-full px-1 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-indigo-700 dark:to-indigo-900 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div
        className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
          isDarkMode ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
      {isDarkMode ? (
        <Moon className="absolute right-1 w-5 h-5 text-indigo-200 dark:text-white" />
      ) : (
        <Sun className="absolute left-1 w-5 h-5 text-yellow-600" />
      )}
    </button>
  );
};
