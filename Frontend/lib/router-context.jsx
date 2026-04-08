// lib/router-context.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RouterContext = createContext(null);

export function useRouter() {
  return useContext(RouterContext);
}

export function Router({ children }) {
  const [path, setPath] = useState(window.location.hash.slice(1) || "/login");

  const navigate = useCallback((to) => {
    window.location.hash = to;
    setPath(to);
  }, []);

  useEffect(() => {
    const handler = () => setPath(window.location.hash.slice(1) || "/login");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}