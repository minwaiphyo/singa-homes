"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Building2,
  Heart,
  Home,
  LogOut,
  Menu,
  Plus,
  User,
  X,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Guides" },
  { href: "/properties", label: "Properties" },
  { href: "/contact", label: "Contact" },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const closeMenus = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-line bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-brand-red-soft text-brand-red">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-brand-navy">
              SingaHomes
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-brand-ink hover:text-brand-red"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href={session ? "/create-listing" : "/auth/sign-in"}
              className="flex items-center gap-2 rounded-full border border-brand-line px-4 py-2 text-sm font-semibold text-brand-ink hover:border-brand-red hover:text-brand-red"
            >
              <Plus className="h-4 w-4" />
              Create Listing
            </Link>

            {status === "loading" ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-transparent p-1 pr-3 hover:border-brand-line hover:bg-slate-50"
                >
                  {session.user.avatar ? (
                    <Image
                      src={session.user.avatar}
                      alt={`${session.user.firstName} ${session.user.lastName}`}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white">
                      {session.user.firstName?.[0]}
                      {session.user.lastName?.[0]}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-brand-ink">
                    {session.user.firstName}
                  </span>
                </button>

                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-brand-line bg-white shadow-lg">
                      <div className="border-b border-brand-line px-4 py-3">
                        <p className="text-sm font-semibold text-brand-ink">
                          {session.user.firstName} {session.user.lastName}
                        </p>
                        <p className="text-sm text-brand-muted">
                          {session.user.email}
                        </p>
                      </div>

                      <div className="py-2">
                        <DropdownLink
                          href={`/profile/${session.user.id}`}
                          icon={<User className="h-4 w-4" />}
                          label="My Profile"
                          onClick={closeMenus}
                        />
                        <DropdownLink
                          href="/my-properties"
                          icon={<Home className="h-4 w-4" />}
                          label="My Properties"
                          onClick={closeMenus}
                        />
                        <DropdownLink
                          href="/favorites"
                          icon={<Heart className="h-4 w-4" />}
                          label="Favorites"
                          onClick={closeMenus}
                        />
                        <div className="mt-2 border-t border-brand-line pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm font-semibold text-brand-red hover:bg-brand-red-soft"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/sign-in"
                  className="text-sm font-semibold text-brand-ink hover:text-brand-red"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen((value) => !value)}
            className="rounded-md p-2 text-brand-ink hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="border-t border-brand-line bg-white py-3 md:hidden">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <MobileLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  onClick={closeMenus}
                />
              ))}

              <MobileLink
                href={session ? "/create-listing" : "/auth/sign-in"}
                label="Create Listing"
                icon={<Plus className="h-5 w-5" />}
                onClick={closeMenus}
              />

              {status !== "loading" && session ? (
                <>
                  <div className="my-3 border-t border-brand-line pt-3">
                    <div className="mb-2 flex items-center gap-3 px-3 py-2">
                      {session.user.avatar ? (
                        <Image
                          src={session.user.avatar}
                          alt={`${session.user.firstName} ${session.user.lastName}`}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy font-semibold text-white">
                          {session.user.firstName?.[0]}
                          {session.user.lastName?.[0]}
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-brand-ink">
                          {session.user.firstName} {session.user.lastName}
                        </p>
                        <p className="text-sm text-brand-muted">
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    <MobileLink
                      href={`/profile/${session.user.id}`}
                      label="My Profile"
                      icon={<User className="h-5 w-5" />}
                      onClick={closeMenus}
                    />
                    <MobileLink
                      href="/my-properties"
                      label="My Properties"
                      icon={<Home className="h-5 w-5" />}
                      onClick={closeMenus}
                    />
                    <MobileLink
                      href="/favorites"
                      label="Favorites"
                      icon={<Heart className="h-5 w-5" />}
                      onClick={closeMenus}
                    />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-brand-red hover:bg-brand-red-soft"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-2 border-t border-brand-line pt-3">
                  <MobileLink
                    href="/auth/sign-in"
                    label="Sign In"
                    onClick={closeMenus}
                  />
                  <Link
                    href="/auth/sign-up"
                    onClick={closeMenus}
                    className="block rounded-full bg-brand-red px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-red-dark"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function DropdownLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-brand-ink hover:bg-brand-red-soft hover:text-brand-red"
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-red-soft hover:text-brand-red"
    >
      {icon}
      {label}
    </Link>
  );
}
