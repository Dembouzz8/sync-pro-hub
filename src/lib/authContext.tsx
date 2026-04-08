import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role: "attendee" | "organizer";
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: "attendee" | "organizer") => void;
  signup: (email: string, password: string, name: string, role: "attendee" | "organizer") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string, role: "attendee" | "organizer") => {
    setUser({ id: "1", email, role, name: email.split("@")[0] });
  };

  const signup = (email: string, _password: string, name: string, role: "attendee" | "organizer") => {
    setUser({ id: "1", email, role, name });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
