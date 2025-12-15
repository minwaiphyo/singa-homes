"use client";

import { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Home, Mail, Lock, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function SignInForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Get callback URL from query params or default to home page
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Show error from URL params (e.g., from NextAuth)
  useEffect(() => {
    if (errorParam) {
      switch (errorParam) {
        case "CredentialsSignin":
          setError("Invalid email or password");
          break;
        case "OAuthSignin":
          setError("OAuth sign-in error");
          break;
        case "OAuthAccountNotLinked":
          setError("This email is already registered with a different method");
          break;
        default:
          setError("An error occurred during sign-in");
      }
    }
  }, [errorParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        switch (result.error) {
          case "CredentialsSignin":
            setError("Invalid email or password");
            break;
          default:
            setError("Sign-in failed. Please try again.");
        }
      } else if (result?.ok) {
        // Get the updated session to ensure user data is loaded
        const session = await getSession();
        if (session) {
          // Successful sign-in
          router.push(callbackUrl);
        } else {
          setError("Authentication failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");
    
    try {
      await signIn("google", {
        callbackUrl,
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // Show loading spinner if session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render the form if already authenticated
  if (status === "authenticated") {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your real estate account</p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* URL Error Message */}
            {errorParam && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm">
                    {errorParam === "CredentialsSignin"
                      ? "Invalid credentials. Please check your email and password."
                      : errorParam === "OAuthAccountNotLinked"
                      ? "This email is already registered with a different method."
                      : "An authentication error occurred. Please try again."}
                  </p>
                </div>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isGoogleLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                  <span className="font-semibold text-gray-700">Signing in...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-semibold text-gray-700">
                    Sign in with Google
                  </span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="your-email@example.com"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                    disabled={isLoading || isGoogleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Links */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      }
    >
      <SignInForm></SignInForm>
    </Suspense>
  );
}