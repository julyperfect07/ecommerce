"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* 404 */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-9xl font-bold text-purple-500"
        >
          404
        </motion.h1>

        <SearchX className="w-16 h-16 text-muted-foreground/30 mx-auto" />

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">Page not found</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="h-11 px-6 text-base"
          >
            Go Back
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="h-11 px-6 text-base bg-purple-600 hover:bg-purple-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
