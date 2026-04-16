import { Outlet } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PrototypeBar } from '../components/PrototypeBar';
import { AuthGuard } from '../components/AuthGuard';

export function RootLayout() {
  const { palette } = useTheme();

  return (
    <AuthGuard>
      <div
        style={{
          backgroundColor: palette.bg,
          color: palette.text,
          minHeight: '100vh',
          fontFamily: 'inherit',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Navbar />
        <main style={{ paddingTop: '64px', paddingBottom: '48px', flex: 1 }}>
          <Outlet />
        </main>
        <Footer />
        {(import.meta as any).env?.VITE_SHOW_PROTOTYPE_BAR === 'true' && <PrototypeBar />}
      </div>
    </AuthGuard>
  );
}
