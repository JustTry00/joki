"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"
import { createOrder } from "@/lib/actions/order-actions"
import { useFormStatus } from "react-dom"

interface CheckoutFormProps {
  tier: {
    id: string
    name: string
    description: string
    price: number
    features: string[]
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Processing..." : "Continue to Payment"}
    </Button>
  )
}

export function CheckoutForm({ tier }: CheckoutFormProps) {
  const [whatsappNumber, setWhatsappNumber] = useState("")

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{tier.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
            <ul className="space-y-2">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>Rp{tier.price.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>We'll send payment instructions to your WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createOrder} className="space-y-4">
            <input type="hidden" name="tierId" value={tier.id} />

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                name="whatsappNumber"
                type="tel"
                placeholder="08123456789"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Format: 08xxx or 628xxx</p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-semibold">Payment Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Click continue to create your order</li>
                <li>Transfer payment to our account</li>
                <li>Upload payment proof</li>
                <li>Wait for admin confirmation</li>
                <li>Receive your token via email</li>
              </ol>
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
