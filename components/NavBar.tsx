"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Settings, Heart, Home, Plus } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Handle Create Listing click - redirect to login if not authenticated
  const handleCreateListingClick = () => {
    if (!session) {
      window.location.href = "/auth/sign-in";
    }
    // If user is authenticated, the Link component will handle the routing
  };

  // Close mobile menu when clicking outside
  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  // Close profile dropdown when clicking outside
  const closeProfileDropdown = () => {
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-gray-900">
            PioProperties
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Create Listing - Always visible */}
            <Link
              href={session ? "/create-listing" : "/auth/sign-in"}
              onClick={session ? undefined : handleCreateListingClick}
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Listing</span>
            </Link>

            {/* Favorites - Only visible if authenticated */}
            {session && (
              <Link
                href="/favorites"
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Favorites</span>
              </Link>
            )}

            {/* Authentication Section */}
            {status === "loading" ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              // Logged in user - Profile dropdown
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {session.user.avatar ? (
                    <img
                      src={session.user.avatar}
                      alt={`${session.user.firstName} ${session.user.lastName}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {session.user.firstName?.[0]}
                        {session.user.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-700 font-medium">
                    {session.user.firstName}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={closeProfileDropdown}
                    ></div>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {session.user.firstName} {session.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {session.user.email}
                          </p>
                        </div>

                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={closeProfileDropdown}
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Profile
                        </Link>

                        <Link
                          href="/my-properties"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={closeProfileDropdown}
                        >
                          <Home className="w-4 h-4 mr-3" />
                          My Properties
                        </Link>

                        <Link
                          href="/favorites"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={closeProfileDropdown}
                        >
                          <Heart className="w-4 h-4 mr-3" />
                          Favorites
                        </Link>

                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={closeProfileDropdown}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </Link>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Not logged in - Login/Register buttons
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/sign-in"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <>
            {/* Backdrop for mobile menu */}
            <div
              className="fixed inset-0 z-10 md:hidden"
              onClick={closeMobileMenu}
            ></div>

            {/* Mobile menu content */}
            <div className="md:hidden bg-white border-t border-gray-200 relative z-20">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Create Listing - Always visible */}
                <Link
                  href={session ? "/create-listing" : "/auth/sign-in"}
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Create Listing
                </Link>

                {/* Mobile Favorites - Only visible if authenticated */}
                {session && (
                  <Link
                    href="/favorites"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Heart className="w-5 h-5 mr-3" />
                    Favorites
                  </Link>
                )}

                {/* Mobile Authentication Section */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  {status === "loading" ? (
                    <div className="px-3 py-2">
                      <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : session ? (
                    // Logged in user - Mobile profile section
                    <div className="space-y-1">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          {session.user.avatar ? (
                            <img
                              src={session.user.avatar}
                              alt={`${session.user.firstName} ${session.user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {session.user.firstName?.[0]}
                                {session.user.lastName?.[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {session.user.firstName} {session.user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {session.user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <User className="w-5 h-5 mr-3" />
                        My Profile
                      </Link>

                      <Link
                        href="/my-properties"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <Home className="w-5 h-5 mr-3" />
                        My Properties
                      </Link>

                      <Link
                        href="/favorites"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <Heart className="w-5 h-5 mr-3" />
                        Favorites
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    // Not logged in - Mobile login/register
                    <div className="space-y-1">
                      <Link
                        href="/auth/sign-in"
                        className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        className="block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors text-center"
                        onClick={closeMobileMenu}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
