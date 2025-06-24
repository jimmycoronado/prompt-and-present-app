
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
  accessToken: string | null;
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to acquire access token silently
  const acquireAccessToken = async (account: AccountInfo) => {
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      });
      console.log('✅ Access token acquired:', response.accessToken.substring(0, 20) + '...');
      
      // 🆕 LOG COMPLETO DEL TOKEN PARA DEBUGGING
      console.log('📋 AZURE ENTRA TOKEN COMPLETO:');
      console.log('-----------------------------------');
      console.log(response.accessToken);
      console.log('-----------------------------------');
      console.log('ℹ️ Token Info:', {
        tokenType: response.tokenType,
        expiresOn: response.expiresOn,
        scopes: response.scopes,
        account: response.account?.username
      });
      
      return response.accessToken;
    } catch (error) {
      console.error('❌ Failed to acquire access token silently:', error);
      try {
        // If silent acquisition fails, try popup
        const response = await instance.acquireTokenPopup({
          ...loginRequest,
          account: account,
        });
        console.log('✅ Access token acquired via popup:', response.accessToken.substring(0, 20) + '...');
        
        // 🆕 LOG COMPLETO DEL TOKEN PARA DEBUGGING (POPUP)
        console.log('📋 AZURE ENTRA TOKEN COMPLETO (via popup):');
        console.log('-----------------------------------');
        console.log(response.accessToken);
        console.log('-----------------------------------');
        console.log('ℹ️ Token Info:', {
          tokenType: response.tokenType,
          expiresOn: response.expiresOn,
          scopes: response.scopes,
          account: response.account?.username
        });
        
        return response.accessToken;
      } catch (popupError) {
        console.error('❌ Failed to acquire access token via popup:', popupError);
        return null;
      }
    }
  };

  useEffect(() => {
    console.log('🔄 Auth state changed:', { 
      inProgress, 
      isAuthenticated, 
      accountsLength: accounts.length,
      accounts: accounts.map(acc => ({
        username: acc.username,
        name: acc.name,
        homeAccountId: acc.homeAccountId
      }))
    });

    if (inProgress === InteractionStatus.None) {
      if (isAuthenticated && accounts.length > 0) {
        const account = accounts[0];
        console.log('👤 Creating user data from account:', {
          username: account.username,
          name: account.name,
          homeAccountId: account.homeAccountId,
          localAccountId: account.localAccountId
        });
        
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
        
        console.log('✅ Setting NEW user data:', userData);
        console.log('🔄 Previous user data was:', user);
        setUser(userData);

        // Acquire access token
        acquireAccessToken(account).then(token => {
          setAccessToken(token);
        });
      } else {
        console.log('❌ No authentication or accounts, setting user to null');
        setUser(null);
        setAccessToken(null);
      }
      setLoading(false);
    } else {
      console.log('⏳ Interaction in progress, keeping loading state');
    }
  }, [isAuthenticated, accounts, inProgress]);

  // Log whenever user state changes
  useEffect(() => {
    console.log('👤 USER STATE CHANGED:', user);
  }, [user]);

  // Log whenever access token changes
  useEffect(() => {
    console.log('🔑 ACCESS TOKEN CHANGED:', accessToken ? accessToken.substring(0, 20) + '...' : null);
  }, [accessToken]);

  const signInWithAzure = async () => {
    try {
      console.log('🚀 Starting loginPopup...');
      // Clear any existing user data before login
      setUser(null);
      setAccessToken(null);
      const result: AuthenticationResult = await instance.loginPopup(loginRequest);
      console.log('✅ Login successful:', result);
      
      // Set access token immediately after login
      if (result.accessToken) {
        setAccessToken(result.accessToken);
        console.log('🔑 Access token set from login result:', result.accessToken.substring(0, 20) + '...');
        
        // 🆕 LOG COMPLETO DEL TOKEN DESPUÉS DEL LOGIN
        console.log('📋 AZURE ENTRA TOKEN COMPLETO (después del login):');
        console.log('-----------------------------------');
        console.log(result.accessToken);
        console.log('-----------------------------------');
        console.log('ℹ️ Token Info después del login:', {
          tokenType: result.tokenType,
          expiresOn: result.expiresOn,
          scopes: result.scopes,
          account: result.account?.username,
          idToken: result.idToken ? 'ID Token presente' : 'No ID Token',
          idTokenClaims: result.idTokenClaims
        });
      }
      
      return { error: null };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Starting logout...');
      await instance.logoutPopup();
      setUser(null);
      setAccessToken(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  const value = {
    user,
    accessToken,
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
