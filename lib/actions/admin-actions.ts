"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createTokenForOrder } from "./token-actions"

export async function getAllOrders() {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  return await prisma.order.findMany({
    include: {
      user: true,
      tier: true,
      token: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function confirmOrder(orderId: string) {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error("Order not found")
  }

  if (order.status !== "PENDING") {
    throw new Error("Order is not pending")
  }

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CONFIRMED",
      confirmedBy: session.user.id,
      confirmedAt: new Date(),
    },
  })

  // Create token and send email
  await createTokenForOrder(orderId)

  revalidatePath("/admin")
  return { success: true }
}

export async function rejectOrder(orderId: string, reason: string) {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error("Order not found")
  }

  if (order.status !== "PENDING") {
    throw new Error("Order is not pending")
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "REJECTED",
      rejectedReason: reason,
    },
  })

  revalidatePath("/admin")
  return { success: true }
}

export async function getAdminStats() {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const [totalOrders, pendingOrders, confirmedOrders, totalRevenue, activeTokens] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { totalPrice: true },
    }),
    prisma.token.count({ where: { active: true } }),
  ])

  return {
    totalOrders,
    pendingOrders,
    confirmedOrders,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    activeTokens,
  }
}
