"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import useAuthStore from "@/app/store/auth.store";
import { logout } from "@/app/services/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CartSheet from "./cart-sheet";

const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [mounted, setMounted] = useState(false);

  const placeholders = [
    "Search for Nike shoes...",
    "Search for iPhone cases...",
    "Search for gaming chairs...",
    "Search for headphones...",
    "Search for watches...",
  ];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?name=${search}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled ? "shadow-lg bg-background/95" : "bg-background/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 md:h-20 gap-3 md:gap-6">
        {/* Left - Logo */}
        <Link href="/" className="shrink-0">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-lg md:text-2xl font-bold tracking-tight"
          >
            Shop<span className="text-purple-500">Wave</span>
          </motion.h1>
        </Link>

        {/* Center - Search Bar (hidden on mobile) */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-2xl hidden md:flex"
        >
          <motion.div
            animate={{ width: focused ? "100%" : "92%" }}
            transition={{ duration: 0.3 }}
            className="relative w-full"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`w-full h-12 pl-11 pr-4 rounded-xl border bg-muted/50 text-base outline-none transition-all duration-300 ${
                focused
                  ? "border-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.15)] bg-background"
                  : "border-border"
              }`}
            />
            {!search && !focused && (
              <div className="absolute inset-0 pl-11 flex items-center pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentPlaceholder}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-base text-muted-foreground"
                  >
                    {placeholders[currentPlaceholder]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </form>

        {/* Right - Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 md:w-10 md:h-10"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          )}

          {isAuthenticated ? (
            <>
              {/* Cart Sheet */}
              <CartSheet />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Avatar className="w-8 h-8 md:w-10 md:h-10 cursor-pointer ring-2 ring-purple-500/50">
                      <AvatarFallback className="bg-purple-600 text-white text-sm md:text-base font-bold">
                        {user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role?.toLowerCase()}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-base py-2"
                    onClick={() => router.push("/profile")}
                  >
                    <User className="w-5 h-5 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-base py-2"
                    onClick={() => router.push("/orders")}
                  >
                    <Package className="w-5 h-5 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  {user?.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-base py-2"
                        onClick={() => router.push("/admin")}
                      >
                        <LayoutDashboard className="w-5 h-5 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-base py-2 text-red-500 focus:text-red-500"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Hide Login on very small screens */}
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-sm md:text-base h-9 md:h-11 px-3 md:px-5"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="text-sm md:text-base h-9 md:h-11 px-3 md:px-5 bg-purple-600 hover:bg-purple-700">
                  Register
                </Button>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden w-9 h-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-12 pl-11 pr-4 rounded-xl border bg-muted/50 text-base outline-none focus:border-purple-500"
                  />
                </div>
              </form>

              {/* Mobile Login if not shown in navbar */}
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="sm:hidden block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}

              <Link
                href="/"
                className="block py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    href="/orders"
                    className="block py-2 text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/profile"
                    className="block py-2 text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="block py-2 text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block py-2 text-base font-medium text-red-500 w-full text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
