import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Saat pertama kali sign in atau update
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true, email: true, name: true, image: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },

  events: {
    // Event ini dipanggil saat user PERTAMA KALI dibuat oleh adapter
    async createUser({ user }) {
      try {
        const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];
        const role = adminEmails.includes(user.email!) ? "admin" : "user";

        // Update role user yang baru dibuat
        await prisma.user.update({
          where: { id: user.id },
          data: { role },
        });

        console.log(`✅ User created with role: ${role} - ${user.email}`);
      } catch (error) {
        console.error("❌ Error setting user role:", error);
      }
    },

    // Event saat user berhasil sign in
    async signIn({ user, account, profile }) {
      console.log(`✅ User signed in: ${user.email}`);
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: "jwt" as const,
  },

  debug: process.env.NODE_ENV === "development", // Enable debug mode di development
} satisfies NextAuthConfig;