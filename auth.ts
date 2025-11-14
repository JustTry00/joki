import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./lib/config/auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
});

export const getServerSession = async () => {
  const session = await auth();
  return session;
};
