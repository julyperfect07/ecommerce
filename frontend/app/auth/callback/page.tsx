"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMe } from "@/app/services/auth";
import useAuthStore from "@/app/store/auth.store";
import api from "@/app/lib/axios";

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const runOnce = useRef(false); // StrictMode defense mechanism against double execution

  useEffect(() => {
    if (runOnce.current) return;
    runOnce.current = true;

    const handleCallback = async () => {
      const token = searchParams.get("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // 1. Submit short-lived token via secure AJAX context body
        await api.post("/auth/google/exchange", { token });

        // 2. Fetch authenticated profile data (Axios carries new cookies automatically)
        const me = await getMe();
        setUser(me);

        // 3. Handshake successful. Send user home
        router.push("/");
      } catch (error) {
        console.error("OAuth Exchange failed:", error);
        router.push("/login");
      }
    };

    handleCallback();
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-lg font-medium text-gray-700">
          Signing you in securely with Google...
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
