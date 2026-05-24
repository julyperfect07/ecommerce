import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/navbar";
import { Providers } from "@/components/layout/providers";
import { AuthProvider } from "@/components/layout/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecommerce App",
  description: "Buy things from diffrent categories you like ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Providers>
            <AuthProvider>
              <Navbar />
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    fontSize: "16px",
                    padding: "16px 24px",
                    borderRadius: "12px",
                  },
                  classNames: {
                    error: "bg-red-500 text-white border-none",
                    success: "bg-purple-600 text-white border-none",
                  },
                }}
              />
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
