"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { login } from "@/app/services/auth";
import { getMe } from "@/app/services/auth";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import useAuthStore from "@/app/store/auth.store";

const LoginPage = () => {
  const router = useRouter();
  const { setUser, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated]);
  if (isAuthenticated) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const me = await getMe();
      setUser(me);
      toast.success("Welcome back! 🎉");
      router.push("/");
    } catch (error) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animated */}
      <div className="hidden lg:flex flex-col w-1/2 relative bg-black overflow-hidden items-center justify-center p-12">
        {/* Animated blobs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 20, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-3xl"
        />

        {/* Brand content */}
        <div className="relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Shop<span className="text-purple-400">Wave</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-sm mx-auto">
              Discover thousands of products from top brands delivered to your
              door
            </p>
          </motion.div>

          {/* Floating feature cards */}
          <div className="flex flex-col gap-3 mt-8">
            {[
              { icon: "🛍️", text: "10,000+ Products" },
              { icon: "🚚", text: "Fast Delivery" },
              { icon: "🔒", text: "Secure Payments" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.2, duration: 0.6 }}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-white font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Shop<span className="text-purple-500">Wave</span>
            </h1>
          </div>

          <Card className="border border-border shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-3xl font-bold text-center tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center text-base tracking-wide">
                Enter your credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="abood@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 text-base"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    "Login"
                  )}
                </Button>

                <p className="text-base text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="text-purple-500 hover:underline font-medium"
                  >
                    Register
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
