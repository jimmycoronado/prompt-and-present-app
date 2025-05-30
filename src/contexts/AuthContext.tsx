
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithAzure: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Si el usuario se autenticó exitosamente y está en la página de auth, redirigir
        if (event === 'SIGNED_IN' && session && window.location.pathname === '/auth') {
          console.log('User signed in, redirecting to home');
          window.location.href = '/';
        }
      }
    );

    // Verificar si estamos procesando un callback de OAuth
    const isOAuthCallback = window.location.hash.includes('access_token');
    
    if (isOAuthCallback) {
      console.log('Processing OAuth callback');
      // Limpiar la URL hash para evitar que se muestre al usuario
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Supabase procesará automáticamente el callback y activará onAuthStateChange
    } else {
      // Si no hay callback, verificar sesión existente
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Current session:', session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const signInWithAzure = async () => {
    // Usar la URL de la página de auth como redirectTo
    const redirectUrl = `${window.location.origin}/auth`;
    console.log('Redirecting to Azure with return URL:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: redirectUrl,
        scopes: 'openid profile email'
      }
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signInWithAzure,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
