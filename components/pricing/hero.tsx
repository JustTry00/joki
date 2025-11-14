"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Code2, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/actions/order-actions";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "next-auth";

interface Tier {
  id: string;
  name: string;
  description: string;
  price: number;
  requests: number;
  duration: number;
  features: string[];
  popular: boolean;
  active: boolean;
}

interface PricingClientProps {
  session: Session;
  tiers: Tier[];
}

export default function PricingClient({ session, tiers }: PricingClientProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    // Scroll to form
    setTimeout(() => {
      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleCreateOrder = () => {
    if (!selectedTier || !whatsappNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a plan and enter your WhatsApp number",
        variant: "destructive",
      });
      return;
    }

    // Validate WhatsApp number format
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid WhatsApp number (10-15 digits)",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await createOrder(selectedTier, cleanNumber);
        
        toast({
          title: "Order Created!",
          description: "Redirecting to payment page...",
        });

        // Redirect to payment page
        router.push(`/payment/${result.orderId}`);
      } catch (error: any) {
        toast({
          title: "Order Failed",
          description: error.message || "Failed to create order. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const activeTiers = tiers.filter(t => t.active);
  const selectedTierData = activeTiers.find(t => t.id === selectedTier);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">TokenGen</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {session.user.email}
            </span>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include instant activation and secure payment processing.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          {activeTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative transition-all duration-200 ${
                selectedTier === tier.id
                  ? "ring-2 ring-primary shadow-lg scale-105"
                  : "hover:shadow-md"
              } ${tier.popular ? "border-primary" : ""}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-primary gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      Rp{(tier.price / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Valid for {tier.duration} days
                  </p>
                </div>

                {/* Key Stats */}
                <div className="space-y-2 py-4 border-y">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">API Requests:</span>
                    <span className="font-semibold">{tier.requests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Validity:</span>
                    <span className="font-semibold">{tier.duration} days</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Select Button */}
                <Button
                  onClick={() => handleSelectTier(tier.id)}
                  className="w-full"
                  variant={selectedTier === tier.id ? "default" : "outline"}
                  disabled={isPending}
                >
                  {selectedTier === tier.id ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    "Select Plan"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Form */}
        {selectedTier && (
          <Card id="order-form" className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle>Complete Your Order</CardTitle>
              <CardDescription>
                Enter your details to proceed with the payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Plan Summary */}
              <div className="bg-primary/5 p-4 rounded-lg space-y-2 border border-primary/20">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Plan:</span>
                  <span className="font-semibold">{selectedTierData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requests:</span>
                  <span className="font-semibold">{selectedTierData?.requests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{selectedTierData?.duration} days</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary/20">
                  <span className="font-medium">Total Price:</span>
                  <span className="font-bold text-xl text-primary">
                    Rp{selectedTierData?.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp">
                  WhatsApp Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="628123456789"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  📱 Enter your WhatsApp number for order notifications (with country code, e.g., 628xxx)
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedTier(null);
                    setWhatsappNumber("");
                  }}
                  disabled={isPending}
                  className="flex-1"
                >
                  Change Plan
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={isPending || !whatsappNumber.trim()}
                  className="flex-1"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Need help choosing the right plan?
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/docs">
              <Button variant="outline" size="sm">
                View Documentation
              </Button>
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "628123456789"}?text=Hi, I need help choosing a plan`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm">
                Contact Support
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}