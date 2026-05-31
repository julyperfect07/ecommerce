"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/app/services/auth";
import useAuthStore from "@/app/store/auth.store";

const AuthCallbackPage = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const me = await getMe();
        setUser(me);
        router.push("/");
      } catch {
        router.push("/login");
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-lg font-medium">Signing you in with Google...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
