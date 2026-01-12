import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  isActive?: boolean;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isBootstrapped: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string | null) => void;
  setBootstrapped: (value: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    accessToken: null,
    isBootstrapped: false,
    setAuth: (user, accessToken) => {
      set({ user, accessToken });
    },
    setAccessToken: (accessToken) => {
      set({ accessToken });
    },
    setBootstrapped: (value) => {
      set({ isBootstrapped: value });
    },
    logout: () => {
      set({ user: null, accessToken: null });
    },
    isAuthenticated: () => {
      return get().user !== null && !!get().accessToken;
    },
    isAdmin: () => {
      return String(get().user?.role || '').toUpperCase() === 'ADMIN';
    },
  }),
);

