
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  PublicClientApplication, 
  AccountInfo, 
  AuthenticationResult,
  InteractionStatus
} from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalConfig, loginRequest } from '@/config/authConfig';

interface User {
  id: string;
  email: string;
  name: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    preferred_username?: string;
  };
}

interface AuthContextType {
  user: User | null;
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

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Auth state changed:', { 
      inProgress, 
      isAuthenticated, 
      accountsLength: accounts.length,
      accounts 
    });

    if (inProgress === InteractionStatus.None) {
      if (isAuthenticated && accounts.length > 0) {
        const account = accounts[0];
        console.log('Creating user data from account:', account);
        
        const userData: User = {
          id: account.homeAccountId,
          email: account.username,
          name: account.name || account.username,
          user_metadata: {
            full_name: account.name,
            name: account.name,
            preferred_username: account.username,
          }
        };
        
        console.log('Setting user data:', userData);
        setUser(userData);
      } else {
        console.log('No authentication or accounts, setting user to null');
        setUser(null);
      }
      setLoading(false);
    } else {
      console.log('Interaction in progress, keeping loading state');
    }
  }, [isAuthenticated, accounts, inProgress]);

  const signInWithAzure = async () => {
    try {
      console.log('Starting loginPopup...');
      const result: AuthenticationResult = await instance.loginPopup(loginRequest);
      console.log('Login successful:', result);
      return { error: null };
    } catch (error) {
      console.error('Login failed:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting logout...');
      await instance.logoutPopup();
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    signInWithAzure,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInner>
        {children}
      </AuthProviderInner>
    </MsalProvider>
  );
};
