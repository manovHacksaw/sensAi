"use client";
import Link from "next/link";
import {
  ChevronDown,
  GraduationCapIcon,
  LayoutDashboard,
  Moon,
  Stars,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; 
import { motion } from "framer-motion";

export function Navbar() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity duration-200"
        >
          SensAI
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Signed Out State */}
          <SignedOut>
            <SignInButton>
              <Button variant="default" size="sm" className="whitespace-nowrap">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          {/* Signed In State */}
          <SignedIn>
            <div className="flex items-center gap-2 md:gap-4">
              {/* Industry Insights Button - Hidden on Mobile */}
              <div className="hidden md:block">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Link href="/dashboard">
                    <Button size="sm" className="whitespace-nowrap" variant="outline">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Industry Insights
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* Growth Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Button size="sm" className="whitespace-nowrap">
                      <Stars className="mr-2 h-4 w-4" />
                      Growth Tools
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full">
                      <GraduationCapIcon className="mr-2 h-4 w-4" />
                      Interview Preparation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Marketing Automation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      SEO Optimization
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Button */}
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:opacity-80 transition-opacity"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </div>
  );
}