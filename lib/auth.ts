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
    async signIn({ user, account, profile }) {
      // Handle Google OAuth users: create/update backend user via POST API
      try {
        if (account?.provider === 'google' && user?.email) {
          const nextAuthUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
          const fullName = (user.name || '').trim();
          const [firstName, ...rest] = fullName.split(' ');
          const lastName = rest.join(' ');
          const randomPassword = Array.from({ length: 32 }, () => Math.random().toString(36).slice(2)).join('');

          // Call backend POST to create user (ignore errors / conflicts)
          await fetch(`${nextAuthUrl}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              password: randomPassword,
              firstName: firstName || 'User',
              lastName: lastName || '',
              avatar: user.image || null,
              isEmailVerified: false,
            }),
          });
        }
      } catch (err) {
        console.error('Error creating user via Google sign-in:', err);
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Handle Google OAuth users by ensuring a DB record exists and attaching its id
      try {
        if (account?.provider === 'google' && user?.email) {
          const email = user.email.toLowerCase();

          let dbUser = await prisma.user.findUnique({ where: { email } });

          if (!dbUser) {
            const fullName = (user.name || '').trim();
            const [firstName, ...rest] = fullName.split(' ');
            const lastName = rest.join(' ');
            const randomPassword = Array.from({ length: 32 }, () => Math.random().toString(36).slice(2)).join('');
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            dbUser = await prisma.user.create({
              data: {
                email,
                password: hashedPassword,
                firstName: firstName || 'User',
                lastName: lastName || '',
                avatar: (user as any).image || null,
                isEmailVerified: true,
              },
            });
          } else {
            const fullName = (user.name || '').trim();
            const [firstName, ...rest] = fullName.split(' ');
            const lastName = rest.join(' ');
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                firstName: firstName || dbUser.firstName,
                lastName: lastName || dbUser.lastName,
                avatar: (user as any).image || dbUser.avatar,
                isEmailVerified: true,
              },
            });
          }

          token.id = dbUser.id;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.avatar = dbUser.avatar;
          token.isEmailVerified = dbUser.isEmailVerified;

          return token;
        }
      } catch (err) {
        console.error('JWT google user upsert error:', err);
      }

      // Initial sign in from CredentialsProvider
      if (user && (user as any).id) {
        token.id = (user as any).id;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.avatar = (user as any).avatar;
        token.isEmailVerified = (user as any).isEmailVerified;
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



