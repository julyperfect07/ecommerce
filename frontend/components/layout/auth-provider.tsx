"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/app/services/auth";
import useAuthStore from "@/app/store/auth.store";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, clearUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true); // 👈 add loading state

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        clearUser();
      } finally {
        setIsLoading(false); // 👈 done checking
      }
    };

    verifyAuth();
  }, []);

  if (isLoading) return null; // 👈 don't render anything until auth is checked

  return <>{children}</>;
};
