import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'ADMIN' | 'PASTOR' | 'SECRETARY' | 'TREASURER' | 'DEPT_LEADER' | 'MEMBER';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  roles: UserRole[];
  avatar_url?: string;
  phone?: string;
  department_id?: string;
  password_changed?: boolean;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsPasswordChange: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string, roles: UserRole[]) => Promise<boolean>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  hasRole: (...roles: UserRole[]) => boolean;
  initialize: () => void;
  checkPasswordChangeRequired: () => boolean;
}

export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  needsPasswordChange: false,

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, needsPasswordChange: false });
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

      const needsChange = get().checkPasswordChangeRequired();
      set({ needsPasswordChange: needsChange });

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
      set({ user: null, profile: null, isAuthenticated: false, needsPasswordChange: false });
    }
  },

  register: async (email: string, password: string, fullName: string, roles: UserRole[]): Promise<boolean> => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            roles,
          },
        },
      });

      if (error) {
        set({ isLoading: false });
        return false;
      }

      set({ user: data.user, isAuthenticated: true, isLoading: false });
      await new Promise(resolve => setTimeout(resolve, 500));
      await get().fetchProfile();

      if (data.user) {
        await supabase
          .from('profiles')
          .update({ password_changed: false })
          .eq('id', data.user.id);

        await get().fetchProfile();
      }

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
          const passwordChanged = data.password_changed ?? true;

          set({ profile: {
            ...data,
            roles: data.roles || ['MEMBER'],
            password_changed: passwordChanged,
          } as UserProfile });

          const needsChange = passwordChanged === false;
          set({ needsPasswordChange: needsChange });

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
    if (!profile) return false;
    return roles.some(r => profile.roles.includes(r));
  },

  updatePassword: async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('[auth] updatePassword error:', error);
        return false;
      }

      const { profile } = get();
      if (profile) {
        const { data: updatedProfile, error: profileError } = await supabase
          .from('profiles')
          .update({ password_changed: true })
          .eq('id', profile.id)
          .select('*')
          .single();

        if (profileError) {
          console.error('[auth] updatePassword profile sync error:', profileError);
          return false;
        }

        set({ 
          profile: {
            ...updatedProfile,
            roles: updatedProfile.roles || ['MEMBER'],
            password_changed: updatedProfile.password_changed ?? true,
          } as UserProfile,
          needsPasswordChange: false 
        });
      }

      return true;
    } catch (err) {
      console.error('[auth] updatePassword caught:', err);
      return false;
    }
  },

  checkPasswordChangeRequired: () => {
    const { profile } = get();
    if (!profile) return false;
    return profile.password_changed === false;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<boolean> => {
    const { user } = get();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: data.full_name || user.user_metadata?.full_name || 'User',
          email: user.email || '',
          roles: data.roles || ['MEMBER'],
          phone: data.phone,
          avatar_url: data.avatar_url,
          department_id: data.department_id,
        }, { onConflict: 'id' });

      if (error) {
        console.error('[auth] updateProfile error:', error);
        throw error;
      }
      return true;
    } catch (err) {
      console.error('[auth] updateProfile caught:', err);
      return false;
    }
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({ user: session.user, isAuthenticated: true, needsPasswordChange: false });
      await get().fetchProfile();
      return;
    }

    set({ user: null, profile: null, isAuthenticated: false, needsPasswordChange: false });
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
      needsPasswordChange: false,
    });
    useAuth.getState().fetchProfile();
  } else {
    useAuth.setState({
      user: null,
      profile: null,
      isAuthenticated: false,
      needsPasswordChange: false,
    });
  }
});

// Cleanup subscription on hot reload (Vite)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    subscription.unsubscribe();
  });
}
