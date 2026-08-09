import { act } from '@testing-library/react';

// Mock zustand
jest.mock('zustand', () => {
  const actualZustand = jest.requireActual('zustand');
  return {
    ...actualZustand,
    create: jest.fn((fn) => fn(actualZustand.set)),
  };
});

// Mock supabase
jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    })),
  },
}));

describe('useAuthStore', () => {
  let useAuthStore;
  let mockSetSession;
  let mockMaybeSingle;
  let mockSignOut;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSetSession = {
      user: { id: 'user123', email: 'test@example.com' },
    };
    
    mockMaybeSingle = jest.fn();
    
    jest.mock('@/config/supabase', () => ({
      supabase: {
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSetSession }, error: null }),
          signOut: jest.fn().mockResolvedValue(),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingle,
        })),
      },
    }));

    // Re-require after mocks are set up
    jest.isolateModules(() => {
      useAuthStore = require('../useAuthStore').useAuthStore;
    });
  });

  describe('initial state', () => {
    test('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.loading).toBe(true);
    });
  });

  describe('setUser action', () => {
    test('should set user correctly', () => {
      const mockUser = { id: '123', email: 'test@test.com' };
      
      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });

  describe('setProfile action', () => {
    test('should set profile correctly', () => {
      const mockProfile = { id: '123', nama: 'Test Guru' };
      
      act(() => {
        useAuthStore.getState().setProfile(mockProfile);
      });

      expect(useAuthStore.getState().profile).toEqual(mockProfile);
    });
  });

  describe('setLoading action', () => {
    test('should set loading to true', () => {
      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      expect(useAuthStore.getState().loading).toBe(true);
    });

    test('should set loading to false', () => {
      act(() => {
        useAuthStore.getState().setLoading(false);
      });

      expect(useAuthStore.getState().loading).toBe(false);
    });
  });

  describe('signOut action', () => {
    test('should call supabase.auth.signOut and reset state', async () => {
      const { supabase } = require('@/config/supabase');
      
      // Set some initial state
      act(() => {
        useAuthStore.getState().setUser({ id: '123' });
        useAuthStore.getState().setProfile({ nama: 'Test' });
      });

      await act(async () => {
        await useAuthStore.getState().signOut();
      });

      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().profile).toBeNull();
    });
  });

  describe('fetchSession action', () => {
    test('should fetch session and profile when user is logged in', async () => {
      const { supabase } = require('@/config/supabase');
      const mockProfile = { id: 'user123', nama: 'John Doe' };
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user123', email: 'test@example.com' } } },
        error: null,
      });
      
      mockMaybeSingle.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      await act(async () => {
        await useAuthStore.getState().fetchSession();
      });

      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(supabase.from).toHaveBeenCalledWith('guru');
      expect(useAuthStore.getState().user).toBeDefined();
      expect(useAuthStore.getState().profile).toEqual(mockProfile);
      expect(useAuthStore.getState().loading).toBe(false);
    });

    test('should handle session error gracefully', async () => {
      const { supabase } = require('@/config/supabase');
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session error'),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await act(async () => {
        await useAuthStore.getState().fetchSession();
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(useAuthStore.getState().loading).toBe(false);
      
      consoleSpy.mockRestore();
    });

    test('should handle profile fetch error gracefully', async () => {
      const { supabase } = require('@/config/supabase');
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user123' } } },
        error: null,
      });
      
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: new Error('Profile error'),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await act(async () => {
        await useAuthStore.getState().fetchSession();
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(useAuthStore.getState().loading).toBe(false);
      
      consoleSpy.mockRestore();
    });

    test('should handle case when profile does not exist', async () => {
      const { supabase } = require('@/config/supabase');
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user123' } } },
        error: null,
      });
      
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await act(async () => {
        await useAuthStore.getState().fetchSession();
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeDefined();
      expect(useAuthStore.getState().profile).toBeNull();
      
      consoleSpy.mockRestore();
    });

    test('should set loading to false when no session', async () => {
      const { supabase } = require('@/config/supabase');
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await act(async () => {
        await useAuthStore.getState().fetchSession();
      });

      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().profile).toBeNull();
    });
  });
});
