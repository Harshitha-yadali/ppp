import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-6 bg-gray-300 dark:bg-dark-300 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-dark-100"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-dark-50 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
          isDarkMode ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {isDarkMode ? (
          <Moon className="w-3 h-3 text-neon-cyan-500" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-between px-1">
        <Sun className={`w-3 h-3 transition-opacity ${isDarkMode ? 'opacity-30' : 'opacity-70'} text-yellow-500`} />
        <Moon className={`w-3 h-3 transition-opacity ${isDarkMode ? 'opacity-70' : 'opacity-30'} text-neon-cyan-500`} />
      </div>
    </button>
  );
};