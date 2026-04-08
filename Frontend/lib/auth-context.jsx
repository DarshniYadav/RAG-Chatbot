// lib/auth-context.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("rag_token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem("rag_user");
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("rag_token", data.access_token);
      localStorage.setItem("rag_user", JSON.stringify({ email, name: email.split("@")[0] }));
      setToken(data.access_token);
      setUser({ email, name: email.split("@")[0] });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // backend expects email + password
      });
      if (!res.ok) throw new Error("Registration failed");
      const data = await res.json();
      localStorage.setItem("rag_token", data.access_token);
      localStorage.setItem("rag_user", JSON.stringify({ email, name }));
      setToken(data.access_token);
      setUser({ email, name });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("rag_token");
    localStorage.removeItem("rag_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}