"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/token-generator"
import { sendTokenEmail } from "@/lib/email"

export async function createTokenForOrder(orderId: string) {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      tier: true,
    },
  })

  if (!order) {
    throw new Error("Order not found")
  }

  if (order.status !== "CONFIRMED") {
    throw new Error("Order must be confirmed first")
  }

  // Check if token already exists
  const existingToken = await prisma.token.findUnique({
    where: { orderId },
  })

  if (existingToken) {
    throw new Error("Token already exists for this order")
  }

  // Generate new token
  const tokenString = generateToken()

  const expiresAt = order.tier.duration > 0 ? new Date(Date.now() + order.tier.duration * 24 * 60 * 60 * 1000) : null

  const token = await prisma.token.create({
    data: {
      userId: order.userId,
      orderId: order.id,
      token: tokenString,
      requests: order.tier.requests,
      maxRequests: order.tier.requests,
      expiresAt,
    },
  })

  // Send email with token
  await sendTokenEmail({
    to: order.user.email!,
    userName: order.user.name || "User",
    token: tokenString,
    tierName: order.tier.name,
    requests: order.tier.requests,
    expiresAt,
  })

  return token
}

export async function validateAndUseToken(tokenString: string, ipAddress?: string, userAgent?: string) {
  const token = await prisma.token.findUnique({
    where: { token: tokenString },
    include: {
      user: true,
    },
  })

  if (!token) {
    return { valid: false, error: "Invalid token" }
  }

  if (!token.active) {
    return { valid: false, error: "Token is inactive" }
  }

  if (token.requests <= 0) {
    return { valid: false, error: "Token has no remaining requests" }
  }

  if (token.expiresAt && token.expiresAt < new Date()) {
    return { valid: false, error: "Token has expired" }
  }

  // Decrement requests and log usage
  await prisma.token.update({
    where: { id: token.id },
    data: {
      requests: { decrement: 1 },
      lastUsedAt: new Date(),
    },
  })

  await prisma.tokenUsage.create({
    data: {
      tokenId: token.id,
      ipAddress,
      userAgent,
    },
  })

  return {
    valid: true,
    remainingRequests: token.requests - 1,
    userId: token.userId,
  }
}

export async function getUserTokens(userId: string) {
  return await prisma.token.findMany({
    where: { userId },
    include: {
      order: {
        include: {
          tier: true,
        },
      },
      _count: {
        select: { usage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getTokenStats(tokenId: string) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const token = await prisma.token.findUnique({
    where: { id: tokenId },
    include: {
      order: {
        include: {
          tier: true,
        },
      },
      usage: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
      _count: {
        select: { usage: true },
      },
    },
  })

  if (!token) {
    throw new Error("Token not found")
  }

  // Check if user owns this token or is admin
  if (token.userId !== session.user.id && session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  return token
}
