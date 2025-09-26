// lib/auth-utils.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

// Server-side session helper
export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

// Get current user data with full profile
export async function getCurrentUser() {
  const session = await getServerAuthSession();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      age: true,
      phone: true,
      bio: true,
      avatar: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          properties: true,
          favorites: true,
        },
      },
    },
  });

  return user;
}

// Middleware helper to protect API routes
export async function requireAuth() {
  const session = await getServerAuthSession();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  return session;
}

// Client-side authentication functions
export const authAPI = {
  // Login function
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email,
        password,
        redirect: 'false',
        json: 'true',
      }),
    });

    return await response.json();
  },

  // Register function
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    age?: number;
    phone?: string;
    bio?: string;
  }) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  },
};