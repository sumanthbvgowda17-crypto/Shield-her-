import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { mockUserData } from '../mock/userData';
import { mockGuardianData } from '../mock/guardianData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to construct a unified user object containing role and fallback mock fields
  const buildAppUser = (supabaseUser, customRole) => {
    if (!supabaseUser) return null;
    const role = customRole || supabaseUser.user_metadata?.role || localStorage.getItem('shieldher_role') || 'user';
    const name = supabaseUser.user_metadata?.full_name || 
                 supabaseUser.user_metadata?.name || 
                 supabaseUser.email?.split('@')[0] || 
                 'Protected User';

    const baseData = role === 'guardian' ? mockGuardianData : mockUserData;

    return {
      ...baseData,
      uid: supabaseUser.id,
      id: supabaseUser.id,
      email: supabaseUser.email,
      name,
      role,
      avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null
    };
  };

  useEffect(() => {
    // 1. Initial check for existing Supabase session or demo session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (initialSession?.user) {
          setSession(initialSession);
          const appUser = buildAppUser(initialSession.user);
          setCurrentUser(appUser);
          localStorage.setItem('shieldher_user', JSON.stringify(appUser));
        } else {
          // Check if there was a demo session in localStorage
          const storedUser = localStorage.getItem('shieldher_user');
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session init note:', err.message);
        const storedUser = localStorage.getItem('shieldher_user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Listen for Supabase auth state changes (OAuth redirect, sign-in, sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const appUser = buildAppUser(newSession.user);
        setCurrentUser(appUser);
        localStorage.setItem('shieldher_user', JSON.stringify(appUser));
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('shieldher_user');
        localStorage.removeItem('shieldher_role');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Supabase Google Login
  const signInWithGoogle = async (preferredRole = 'user') => {
    localStorage.setItem('shieldher_role', preferredRole);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    if (error) throw error;
    return data;
  };

  // Supabase Email & Password Sign In
  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data?.user) {
      const appUser = buildAppUser(data.user);
      setCurrentUser(appUser);
      localStorage.setItem('shieldher_user', JSON.stringify(appUser));
    }
    return data;
  };

  // Supabase Email & Password Sign Up
  const signUpWithEmail = async (email, password, { name, role = 'user' } = {}) => {
    localStorage.setItem('shieldher_role', role);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role
        }
      }
    });
    if (error) throw error;
    if (data?.user) {
      const appUser = buildAppUser(data.user, role);
      setCurrentUser(appUser);
      localStorage.setItem('shieldher_user', JSON.stringify(appUser));
    }
    return data;
  };

  // Demo user login for fast testing
  const loginDemoUser = () => {
    const user = { ...mockUserData, role: 'user', uid: 'demo-user-123', email: 'demo.user@shieldher.local' };
    setCurrentUser(user);
    localStorage.setItem('shieldher_user', JSON.stringify(user));
    localStorage.setItem('shieldher_role', 'user');
  };

  // Demo guardian login for fast testing
  const loginDemoGuardian = () => {
    const guardian = { ...mockGuardianData, role: 'guardian', uid: 'demo-guardian-456', email: 'demo.guardian@shieldher.local' };
    setCurrentUser(guardian);
    localStorage.setItem('shieldher_user', JSON.stringify(guardian));
    localStorage.setItem('shieldher_role', 'guardian');
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore if offline or demo
    }
    setCurrentUser(null);
    setSession(null);
    localStorage.removeItem('shieldher_user');
    localStorage.removeItem('shieldher_role');
  };

  const value = {
    currentUser,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loginDemoUser,
    loginDemoGuardian,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Loading ShieldHer...</span>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
