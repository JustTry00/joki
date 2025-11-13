import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getOrderById } from "@/lib/actions/order-actions"
import { PaymentInstructions } from "@/components/payment-instructions"

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const session = await auth()
  const { orderId } = await params

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const order = await getOrderById(orderId)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <PaymentInstructions order={order} />
        </div>
      </div>
    </div>
  )
}
