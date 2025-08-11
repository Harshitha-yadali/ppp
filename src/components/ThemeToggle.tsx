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
      {/* This div is the sliding thumb that will contain the icons */}
      <div
        className={`absolute top-1 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center
          ${isDarkMode ? 'translate-x-6 bg-gray-700' : 'translate-x-1 bg-yellow-500'} /* Change background and position based on mode */
        `}
      >
        {/* Sun icon: visible when in light mode */}
        <Sun className={`w-5 h-5 text-white transition-opacity duration-300 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`} />
        {/* Moon icon: visible when in dark mode */}
        <Moon className={`w-5 h-5 text-white transition-opacity duration-300 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </button>
  );
};
