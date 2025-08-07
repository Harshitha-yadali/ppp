import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext'; // ✅ Import this
import { ThemeProvider } from './contexts/ThemeContext';

createRoot(document.getElementById('root')!).render(
  
    <ThemeProvider>
      <AuthProvider> {/* ✅ Wrap App with AuthProvider */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  
);
