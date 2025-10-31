import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type UserRole = 'owner' | 'admin' | 'annotator' | 'viewer';

interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

interface AuthContextType {
  user: MockUser | null;
  session: { user: MockUser } | null;
  loading: boolean;
  role: UserRole | null;
  organisationId: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data storage
const STORAGE_KEY = 'mock_auth_user';

export function AuthProviderMock({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<{ user: MockUser } | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      const mockUser = JSON.parse(storedUser);
      setUser(mockUser);
      setSession({ user: mockUser });
      setRole('owner');
      setOrganisationId('mock-org-id');
    }
    setLoading(false);
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: MockUser = {
      id: 'mock-user-id',
      email,
      user_metadata: {
        full_name: 'Mock User'
      }
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setSession({ user: mockUser });
    setRole('owner');
    setOrganisationId('mock-org-id');
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: MockUser = {
      id: 'mock-user-id',
      email,
      user_metadata: {
        full_name: fullName
      }
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setSession({ user: mockUser });
    setRole('owner');
    setOrganisationId('mock-org-id');
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setSession(null);
    setRole(null);
    setOrganisationId(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      role,
      organisationId,
      signInWithEmail,
      signUpWithEmail,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProviderMock');
  }
  return context;
}
