import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type UserRole = 'creator' | 'fan' | 'brand';

export interface AuthUser {
  name: string;
  email: string;
  picture: string;
  role: UserRole;
  dob?: string;        // YYYY-MM-DD
  genres?: string[];   // interested genres
}

export interface UserProfile {
  dob: string;
  genres: string[];
}

export function saveUserProfile(email: string, profile: UserProfile) {
  localStorage.setItem(`fanfolio_profile_${email}`, JSON.stringify(profile));
}

export function loadUserProfile(email: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(`fanfolio_profile_${email}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

const SESSION_KEY = 'fanzfolio_session';
// Unscoped session keys that must be cleared on every sign-in/sign-out
const SESSION_TRANSIENT_KEYS = ['fanfolio_report', 'fanfolio_analysis_id'];

function clearTransientSession() {
  SESSION_TRANSIENT_KEYS.forEach(k => sessionStorage.removeItem(k));
}

function loadSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadSession);

  const signIn = useCallback((u: AuthUser) => {
    clearTransientSession(); // wipe any previous creator's report/analysis
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const signOut = useCallback(() => {
    clearTransientSession();
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
