"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getMe } from "@/app/services/auth";
import useAuthStore from "@/app/store/auth.store";

const publicRoutes = ["/login", "/register"];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isPublicRoute = pathname ? publicRoutes.includes(pathname) : false;

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const me = await getMe();
        useAuthStore.getState().setUser(me);
      } catch {
        useAuthStore.getState().clearUser();
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};
