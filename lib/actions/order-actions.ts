"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function createOrder(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const tierId = formData.get("tierId") as string
  const whatsappNumber = formData.get("whatsappNumber") as string

  if (!tierId || !whatsappNumber) {
    throw new Error("Missing required fields")
  }

  const tier = await prisma.tier.findUnique({
    where: { id: tierId },
  })

  if (!tier || !tier.active) {
    throw new Error("Invalid tier")
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      tierId: tier.id,
      whatsappNumber,
      totalPrice: tier.price,
      status: "PENDING",
    },
  })

  redirect(`/payment/${order.id}`)
}

export async function uploadPaymentProof(orderId: string, proofUrl: string) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error("Order not found")
  }

  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  if (order.status !== "PENDING") {
    throw new Error("Order cannot be modified")
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentProof: proofUrl,
    },
  })

  return { success: true }
}

export async function getUserOrders(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      tier: true,
      token: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOrderById(orderId: string) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      tier: true,
      user: true,
      token: true,
    },
  })

  if (!order) {
    throw new Error("Order not found")
  }

  // Check if user owns this order or is admin
  if (order.userId !== session.user.id && session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  return order
}
