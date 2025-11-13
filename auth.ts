import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      // Check if user is admin
      const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
      const isAdmin = adminEmails.includes(user.email)

      // Update or create user with role
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          image: user.image,
          role: isAdmin ? "admin" : "user",
        },
        create: {
          email: user.email,
          name: user.name,
          image: user.image,
          role: isAdmin ? "admin" : "user",
        },
      })

      return true
    },
  },
})
