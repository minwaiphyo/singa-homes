// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
  
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email", 
          placeholder: "your-email@example.com" 
        },
        password: { 
          label: "Password", 
          type: "password" 
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase(),
            },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isEmailVerified: true,
            },
          });

          if (!user) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes (in seconds)
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.avatar = user.avatar;
        token.isEmailVerified = user.isEmailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.avatar = token.avatar as string | null;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}



