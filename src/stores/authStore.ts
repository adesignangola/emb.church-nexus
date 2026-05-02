import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'ADMIN' | 'PASTOR' | 'SECRETARY' | 'TREASURER' | 'DEPT_LEADER' | 'MEMBER';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  department_id?: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<boolean>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  hasRole: (...roles: UserRole[]) => boolean;
  initialize: () => void;
}

export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ isLoading: false });
        return false;
      }

      set({ user: data.user, isAuthenticated: true, isLoading: false });
      await get().fetchProfile();
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      set({ user: null, profile: null, isAuthenticated: false });
    }
  },

  register: async (email: string, password: string, fullName: string, role: UserRole): Promise<boolean> => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) {
        set({ isLoading: false });
        return false;
      }

      set({ user: data.user, isAuthenticated: true, isLoading: false });
      // Wait briefly for trigger to create profile, then fetch it
      await new Promise(resolve => setTimeout(resolve, 500));
      await get().fetchProfile();
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      let retries = 3;
      while (retries > 0) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          set({ profile: data as UserProfile });
          return;
        }

        if (error && error.code !== 'PGRST116') {
          console.warn('[auth] Profile fetch error:', error.code, error.message);
          throw error;
        }
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      console.warn('[auth] Profile not found for user:', user.id);
    } catch (err) {
      console.error('[auth] Failed to fetch profile:', err);
    }
  },

  hasRole: (...roles) => {
    const { profile } = get();
    return profile ? roles.includes(profile.role) : false;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<boolean> => {
    const { user } = get();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({ user: session.user, isAuthenticated: true });
      await get().fetchProfile();
    }
  },
}));

// Initialize auth state once on module load
useAuth.getState().initialize();

// Listen for auth changes with proper subscription
const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    useAuth.setState({
      user: session.user,
      isAuthenticated: true,
    });
    useAuth.getState().fetchProfile();
  } else {
    useAuth.setState({
      user: null,
      profile: null,
      isAuthenticated: false,
    });
  }
});

// Cleanup subscription on hot reload (Vite)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    subscription.unsubscribe();
  });
}
