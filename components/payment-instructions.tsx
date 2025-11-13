"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Upload, CheckCircle2, Clock, XCircle } from "lucide-react"
import Link from "next/link"
import { uploadPaymentProof } from "@/lib/actions/order-actions"
import { useToast } from "@/hooks/use-toast"

interface PaymentInstructionsProps {
  order: {
    id: string
    status: string
    totalPrice: number
    whatsappNumber: string
    paymentProof: string | null
    tier: {
      name: string
    }
  }
}

export function PaymentInstructions({ order }: PaymentInstructionsProps) {
  const [proofUrl, setProofUrl] = useState(order.paymentProof || "")
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const adminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6281234567890"
  const whatsappMessage = `Halo, saya ingin konfirmasi pembayaran untuk Order ID: ${order.id}`
  const whatsappLink = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  const handleUploadProof = async () => {
    if (!proofUrl) {
      toast({
        title: "Error",
        description: "Please enter the payment proof URL",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      await uploadPaymentProof(order.id, proofUrl)
      toast({
        title: "Success",
        description: "Payment proof uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload payment proof",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = () => {
    switch (order.status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending Payment
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Instructions</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>
        {getStatusBadge()}
      </div>

      {order.status === "CONFIRMED" && (
        <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your payment has been confirmed! Check your email for the access token.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
            <CardDescription>Transfer to the following account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Bank Name</Label>
              <div className="flex items-center justify-between mt-1">
                <p className="font-semibold">Bank BCA</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Account Number</Label>
              <div className="flex items-center justify-between mt-1">
                <p className="font-semibold">1234567890</p>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard("1234567890")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Account Name</Label>
              <div className="flex items-center justify-between mt-1">
                <p className="font-semibold">TokenGen Indonesia</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Amount</Label>
              <div className="flex items-center justify-between mt-1">
                <p className="font-semibold text-xl">Rp{order.totalPrice.toLocaleString("id-ID")}</p>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(order.totalPrice.toString())}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Payment Proof</CardTitle>
            <CardDescription>Upload your payment receipt or transfer proof</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof">Image URL</Label>
              <Input
                id="proof"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                disabled={order.status !== "PENDING"}
              />
              <p className="text-xs text-muted-foreground">
                Upload your image to a service like imgur.com and paste the URL
              </p>
            </div>

            <Button onClick={handleUploadProof} disabled={uploading || order.status !== "PENDING"} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Proof"}
            </Button>

            <div className="pt-4 border-t">
              <p className="text-sm font-semibold mb-2">Need Help?</p>
              <Link href={whatsappLink} target="_blank">
                <Button variant="outline" className="w-full bg-transparent">
                  Contact Admin via WhatsApp
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Complete the bank transfer to the account above</li>
            <li>Upload your payment proof using the form</li>
            <li>Wait for admin confirmation (usually within 1-24 hours)</li>
            <li>Once confirmed, you'll receive your access token via email</li>
            <li>Use the token to access the API</li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Link href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
