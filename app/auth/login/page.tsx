"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Monitor, Home, Zap, Shield } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const { signIn } = useAuth();
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      const error = err as Error;
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Monitor className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Comprint Services
            </span>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="hover:scale-105 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <Badge
              variant="secondary"
              className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-800 dark:text-blue-200 border-0"
            >
              <Shield className="w-3 h-3 mr-1" />
              Staff Portal
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-lg">
              Sign in to access your dashboard and manage operations
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-gray-950/80 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>

            <CardHeader className="relative z-10 pb-6 space-y-4 text-center"></CardHeader>

            <CardContent className="relative z-10 px-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    disabled={isLoading}
                    className={`rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-2 h-12 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    } focus:ring-2 focus:ring-blue-500/20 dark:text-white dark:placeholder-gray-400 transition-all duration-300`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    disabled={isLoading}
                    className={`rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-2 h-12 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    } focus:ring-2 focus:ring-blue-500/20 dark:text-white dark:placeholder-gray-400 transition-all duration-300`}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      Sign in to Dashboard
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="relative z-10 pb-8 pt-4 text-center">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Secure Login</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-500"></div>
                    <span>24/7 Support</span>
                  </div>
                </div>
                {/* <p className="text-sm text-muted-foreground">
                  Need help accessing your account?{" "}
                  <Link
                    href="#contact"
                    className="text-primary hover:underline font-medium"
                  >
                    Contact Support
                  </Link>
                </p> */}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
