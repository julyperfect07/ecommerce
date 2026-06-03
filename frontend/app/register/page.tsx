"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { register } from "@/app/services/auth";
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
import { useTheme } from "next-themes";

const RegisterPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated]);

  if (isAuthenticated) return null;

  const validateEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register(email.trim(), password);
      toast.success("Account created successfully! 🎉");
      router.push("/login");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="h-screen flex items-center lg:items-stretch overflow-hidden">
      {/* Left Side */}
      <div
        className={`hidden lg:flex flex-col w-1/2 relative overflow-hidden items-center justify-center p-12 ${
          isDark
            ? "bg-black"
            : "bg-linear-to-br from-purple-600 via-purple-500 to-violet-600"
        }`}
      >
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl ${
            isDark ? "bg-purple-600/30" : "bg-white/20"
          }`}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl ${
            isDark ? "bg-violet-600/20" : "bg-white/15"
          }`}
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 20, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl ${
            isDark ? "bg-fuchsia-600/20" : "bg-white/10"
          }`}
        />

        <div className="relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Shop<span className="text-white/70">Wave</span>
            </h1>
            <p className="text-lg text-white/80 max-w-sm mx-auto">
              Discover thousands of products from top brands delivered to your
              door
            </p>
          </motion.div>

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
                className="flex items-center gap-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-white font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background px-4 sm:px-6 py-10 lg:px-8 lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm mx-4 sm:mx-0"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Shop<span className="text-purple-500">Wave</span>
            </h1>
          </div>

          <Card className="border border-border shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center tracking-tight">
                Welcome
              </CardTitle>
              <CardDescription className="text-center text-base">
                Let's create your account
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    "Register"
                  )}
                </Button>

                <p className="text-base text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-purple-500 hover:underline font-medium"
                  >
                    Login
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

export default RegisterPage;
