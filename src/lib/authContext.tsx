import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  role: "attendee" | "organizer";
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: "attendee" | "organizer") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(supabaseUser: SupabaseUser): Promise<User | null> {
  const { data } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", supabaseUser.id)
    .single();

  if (!data) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    role: data.role as "attendee" | "organizer",
    name: data.full_name ?? supabaseUser.email?.split("@")[0] ?? "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST so we catch the INITIAL_SESSION event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Kick-start the session restore (triggers onAuthStateChange with INITIAL_SESSION)
    supabase.auth.getSession().then(({ error }) => {
  if (error) {
    supabase.auth.signOut();
    setLoading(false);
  }
});

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string, name: string, role: "attendee" | "organizer") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: name,
        email,
        role,
      });
    }
  };

  const logout = async () => {
    setUser(null);
    setLoading(false);
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
