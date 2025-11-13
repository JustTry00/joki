import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding tiers...")

  // Delete existing tiers
  await prisma.tier.deleteMany({})

  // Create tiers
  const tiers = [
    {
      name: "Starter",
      description: "Perfect untuk testing dan penggunaan personal",
      price: 50000,
      requests: 100,
      duration: 30,
      features: ["100 requests", "Valid 30 hari", "Email support", "Basic documentation"],
      popular: false,
      active: true,
    },
    {
      name: "Professional",
      description: "Ideal untuk developer dan penggunaan intensive",
      price: 150000,
      requests: 500,
      duration: 60,
      features: [
        "500 requests",
        "Valid 60 hari",
        "Priority email support",
        "Advanced documentation",
        "Usage analytics",
      ],
      popular: true,
      active: true,
    },
    {
      name: "Enterprise",
      description: "Untuk organisasi dengan kebutuhan unlimited",
      price: 500000,
      requests: 999999,
      duration: 365,
      features: [
        "Unlimited requests",
        "Valid 1 tahun",
        "24/7 support",
        "Custom integration",
        "Dedicated account manager",
        "API access",
      ],
      popular: false,
      active: true,
    },
  ]

  for (const tier of tiers) {
    const created = await prisma.tier.create({
      data: tier,
    })
    console.log(`Created tier: ${created.name}`)
  }

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
