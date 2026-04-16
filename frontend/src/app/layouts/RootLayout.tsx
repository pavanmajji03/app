import { Outlet } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { Navbar } from '../components/Navbar';
import { PrototypeBar } from '../components/PrototypeBar';

export function RootLayout() {
  const { palette } = useTheme();

  return (
    <div
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
        minHeight: '100vh',
        fontFamily: 'inherit',
      }}
    >
      <Navbar />
      <main style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <Outlet />
      </main>
      <PrototypeBar />
    </div>
  );
}
