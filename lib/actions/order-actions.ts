// lib/actions/order-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// ============================================
// GET ACTIONS
// ============================================

export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      tier: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Serialize dates
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    tier: {
      ...order.tier,
      createdAt: order.tier.createdAt.toISOString(),
      updatedAt: order.tier.updatedAt.toISOString(),
    },
  };
}

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      tier: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    tier: {
      ...order.tier,
      createdAt: order.tier.createdAt.toISOString(),
      updatedAt: order.tier.updatedAt.toISOString(),
    },
  }));
}

// ============================================
// PAYMENT PROOF ACTIONS
// ============================================

export async function uploadPaymentProof(orderId: string, proofUrl: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized - Please sign in");
  }

  // Validate URL format
  try {
    const url = new URL(proofUrl);
    // Check if URL is from allowed domains (optional)
    const allowedDomains = ["imgur.com", "i.imgur.com", "ibb.co", "i.ibb.co", "imgbb.com"];
    const isAllowed = allowedDomains.some((domain) => url.hostname.includes(domain));
    
    if (!isAllowed) {
      throw new Error("Please use supported image hosting services (imgur.com, imgbb.com)");
    }
  } catch (error) {
    throw new Error("Invalid image URL format");
  }

  // Verify order belongs to user
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      tier: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized - This order doesn't belong to you");
  }

  if (order.status !== "PENDING") {
    throw new Error(`Cannot upload proof - Order status is ${order.status}`);
  }

  // Update order with payment proof
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentProof: proofUrl,
      updatedAt: new Date(),
    },
  });

  // TODO: Send notification to admin via email/webhook
  // await sendAdminNotification({
  //   orderId: order.id,
  //   userName: session.user.name,
  //   tierName: order.tier.name,
  //   amount: order.totalPrice,
  //   proofUrl: proofUrl,
  // });

  revalidatePath(`/payment/${orderId}`);
  revalidatePath("/dashboard");

  return { 
    success: true, 
    message: "Payment proof uploaded successfully! Admin will review within 24 hours.",
    order: updatedOrder,
  };
}

export async function deletePaymentProof(orderId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (order.status !== "PENDING") {
    throw new Error("Cannot delete proof - Order is no longer pending");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentProof: null,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/payment/${orderId}`);
  revalidatePath("/dashboard");

  return { success: true, message: "Payment proof deleted" };
}

// ============================================
// ORDER CREATION
// ============================================

export async function createOrder(tierId: string, whatsappNumber: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized - Please sign in");
  }

  // Validate WhatsApp number
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
  if (cleanNumber.length < 10 || cleanNumber.length > 15) {
    throw new Error("Invalid WhatsApp number format (must be 10-15 digits)");
  }

  // Validate tier exists and is active
  const tier = await prisma.tier.findUnique({
    where: { id: tierId },
  });

  if (!tier) {
    throw new Error("Invalid plan selected");
  }

  if (!tier.active) {
    throw new Error("This plan is no longer available");
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      tierId: tier.id,
      whatsappNumber: cleanNumber,
      totalPrice: tier.price,
      status: "PENDING",
    },
    include: {
      tier: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/pricing");

  return {
    success: true,
    orderId: order.id,
    orderDetails: {
      id: order.id,
      tierName: tier.name,
      totalPrice: tier.price,
      whatsappNumber: cleanNumber,
    },
    message: "Order created successfully! Redirecting to payment page...",
  };
}

// ============================================
// ORDER MANAGEMENT ACTIONS
// ============================================

export async function cancelOrder(orderId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (order.status !== "PENDING") {
    throw new Error("Can only cancel pending orders");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "REJECTED",
      rejectedReason: "Cancelled by user",
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/payment/${orderId}`);
  revalidatePath("/dashboard");

  return { success: true, message: "Order cancelled successfully" };
}

export async function retryPayment(orderId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (order.status !== "REJECTED" && order.status !== "EXPIRED") {
    throw new Error("Can only retry rejected or expired orders");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PENDING",
      paymentProof: null,
      rejectedReason: null,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/payment/${orderId}`);
  revalidatePath("/dashboard");

  return { success: true, message: "Order reset to pending. Please upload payment proof." };
}