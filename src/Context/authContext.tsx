import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChange } from "../backend/authUtil";
import type { User } from "firebase/auth";
import { ErrorBoundary } from "react-error-boundary";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((fbUser) => {
      setUser(fbUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <ErrorBoundary fallbackRender={() => <div>Something went wrong with authentication</div>}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </ErrorBoundary>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
