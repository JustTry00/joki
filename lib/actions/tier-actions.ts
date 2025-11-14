"use server";

import { prisma } from "@/lib/prisma";

export async function getTiers() {
  const tiers = await prisma.tier.findMany({
    where: {
      active: true,
    },
    orderBy: {
      price: "asc",
    },
  });

  return tiers.map((tier) => ({
    ...tier,
    createdAt: tier.createdAt.toISOString(),
    updatedAt: tier.updatedAt.toISOString(),
  }));
}