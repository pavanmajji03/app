import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import { initApiConfig } from './services/apiService';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initApiConfig().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
}
