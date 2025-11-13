import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CheckoutForm } from "@/components/checkout-form"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>
}) {
  const session = await auth()
  const params = await searchParams

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (!params.tier) {
    redirect("/")
  }

  const tier = await prisma.tier.findUnique({
    where: { id: params.tier },
  })

  if (!tier || !tier.active) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground mb-8">You're purchasing the {tier.name} plan</p>
          <CheckoutForm tier={tier} />
        </div>
      </div>
    </div>
  )
}
