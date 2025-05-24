"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { useRouter } from "next/navigation";
import { UserRole } from "./types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache user role to avoid unnecessary database queries
const userRoleCache = new Map<string, UserRole>();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserRole = async (userId: string) => {
    try {
      // Check cache first
      if (userRoleCache.has(userId)) {
        return userRoleCache.get(userId);
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching user role:", error);
        }
        return null;
      }

      const role = data?.role as UserRole;

      // Cache the result
      if (role) {
        userRoleCache.set(userId, role);
      }

      return role;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error in fetchUserRole:", error);
      }
      return null;
    }
  };

  const updateUserState = async (
    currentUser: User | null,
    currentSession: Session | null
  ) => {
    try {
      if (currentUser) {
        const role = await fetchUserRole(currentUser.id);
        setUserRole(role);
      }
      setUser(currentUser);
      setSession(currentSession);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error in updateUserState:", error);
      }
    }
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Clear cache for this user to get fresh data
        userRoleCache.delete(session.user.id);
        await updateUserState(session.user, session);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error refreshing user data:", error);
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await updateUserState(session.user, session);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error in initializeAuth:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await updateUserState(session.user, session);
        router.push("/dashboard");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setUserRole(null);
        router.push("/auth/login");
      } else if (event === "USER_UPDATED" && session) {
        // Handle user profile updates
        await updateUserState(session.user, session);
      } else if (event === "TOKEN_REFRESHED" && session) {
        // Update session only
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        await updateUserState(data.user, data.session);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear cache on sign out
      userRoleCache.clear();

      setUser(null);
      setSession(null);
      setUserRole(null);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error in signOut:", error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        loading,
        signIn,
        signOut,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
