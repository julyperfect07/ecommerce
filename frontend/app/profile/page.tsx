"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "@/app/store/auth.store";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Shield, Save, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/app/lib/axios";

const ProfilePage = () => {
  const router = useRouter();
  const { user, setUser, isAuthenticated } = useAuthStore();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  if (!isAuthenticated) return null;

  const { mutate: handleUpdate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/user/${user?.id}`, { name });
      return res.data;
    },
    onSuccess: (data) => {
      setUser({ ...user!, name: data.user.name });
      toast.success("Profile updated successfully! 🎉");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdate();
  };

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-base font-medium">Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Header */}
        <Card className="border shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-white">
                  {user?.email?.[0].toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div>
                <h2 className="text-2xl font-bold">
                  {user?.name || "No name set"}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <Badge
                  className={`mt-2 ${
                    user?.role === "ADMIN"
                      ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                      : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  }`}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email - readonly */}
            <div className="space-y-2">
              <Label className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="h-11 text-base bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Member since */}
            <div className="space-y-2">
              <Label className="text-base">Member Since</Label>
              <Input
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""
                }
                disabled
                className="h-11 text-base bg-muted/50 cursor-not-allowed"
              />
            </div>
          </CardContent>
        </Card>

        {/* Edit Name */}
        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Save className="w-5 h-5 text-purple-500" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Display Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base bg-purple-600 hover:bg-purple-700"
                disabled={isPending}
              >
                {isPending ? (
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
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border border-red-500/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-500">
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/orders")}
            >
              <Package className="w-4 h-4 mr-2" />
              View My Orders
            </Button>
            {user?.role === "ADMIN" && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/admin")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
};

export default ProfilePage;
