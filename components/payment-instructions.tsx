// components/payment-instructions.tsx
"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Copy,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Trash2,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { uploadPaymentProof, deletePaymentProof, cancelOrder, retryPayment,  } from "@/lib/actions/order-actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaymentInstructionsProps {
  order: {
    id: string;
    status: string;
    totalPrice: number;
    whatsappNumber: string;
    paymentProof: string | null;
    rejectedReason: string | null;
    createdAt: string;
    tier: {
      name: string;
      description: string;
    };
  };
}

export function PaymentInstructions({ order }: PaymentInstructionsProps) {
  const [proofUrl, setProofUrl] = useState(order.paymentProof || "");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const adminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6281234567890";
  const whatsappMessage = `Halo Admin, saya ingin konfirmasi pembayaran:\n\nOrder ID: ${order.id}\nTier: ${order.tier.name}\nTotal: Rp${order.totalPrice.toLocaleString("id-ID")}\nWhatsApp: ${order.whatsappNumber}`;
  const whatsappLink = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleUploadProof = () => {
    if (!proofUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter the payment proof URL",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await uploadPaymentProof(order.id, proofUrl.trim());
        toast({
          title: "Success!",
          description: result.message,
        });
        router.refresh();
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload payment proof",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteProof = () => {
    startTransition(async () => {
      try {
        await deletePaymentProof(order.id);
        setProofUrl("");
        toast({
          title: "Deleted",
          description: "Payment proof deleted successfully",
        });
        router.refresh();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleCancelOrder = () => {
    startTransition(async () => {
      try {
        await cancelOrder(order.id);
        toast({
          title: "Order Cancelled",
          description: "Your order has been cancelled",
        });
        router.push("/dashboard");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleRetryPayment = () => {
    startTransition(async () => {
      try {
        await retryPayment(order.id);
        toast({
          title: "Order Reset",
          description: "You can now upload payment proof again",
        });
        router.refresh();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="gap-1 text-orange-600 border-orange-600">
            <Clock className="h-3 w-3" />
            Waiting Payment
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="gap-1 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Payment Confirmed
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Payment Rejected
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3" />
            Order Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusAlert = () => {
    switch (order.status) {
      case "CONFIRMED":
        return (
          <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">Payment Confirmed!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Your payment has been verified. Check your dashboard for the access token or email for further instructions.
            </AlertDescription>
          </Alert>
        );
      case "REJECTED":
        return (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Payment Rejected</AlertTitle>
            <AlertDescription>
              {order.rejectedReason || "Your payment proof was rejected. Please contact admin for details."}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={handleRetryPayment} disabled={isPending}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Payment
                </Button>
                <Link href={whatsappLink} target="_blank">
                  <Button size="sm" variant="outline">Contact Admin</Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        );
      case "PENDING":
        if (order.paymentProof) {
          return (
            <Alert className="border-blue-600 bg-blue-50 dark:bg-blue-950">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800 dark:text-blue-200">Under Review</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Your payment proof is being reviewed by admin. This usually takes 1-24 hours.
              </AlertDescription>
            </Alert>
          );
        }
        return (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              Please complete your payment and upload the proof below to proceed with your order.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const canUploadProof = order.status === "PENDING";
  const hasProof = !!order.paymentProof;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Instructions</h1>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p>Order ID: <span className="font-mono text-foreground">{order.id}</span></p>
            <p>Created: {new Date(order.createdAt).toLocaleString("id-ID")}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Status Alert */}
      {getStatusAlert()}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan:</span>
            <span className="font-semibold">{order.tier.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Description:</span>
            <span className="text-sm text-right max-w-xs">{order.tier.description}</span>
          </div>
          <div className="flex justify-between pt-3 border-t">
            <span className="text-muted-foreground">Total Payment:</span>
            <span className="font-bold text-xl">Rp{order.totalPrice.toLocaleString("id-ID")}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Transfer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Transfer Details</CardTitle>
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
              <div className="flex items-center justify-between mt-1 bg-muted p-2 rounded">
                <p className="font-mono font-semibold">1234567890</p>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => copyToClipboard("1234567890", "Account number")}
                >
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
              <Label className="text-xs text-muted-foreground">Transfer Amount</Label>
              <div className="flex items-center justify-between mt-1 bg-primary/10 p-3 rounded">
                <p className="font-bold text-xl">Rp{order.totalPrice.toLocaleString("id-ID")}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(order.totalPrice.toString(), "Amount")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                💡 Transfer exact amount for faster verification
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Payment Proof */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Payment Proof</CardTitle>
            <CardDescription>
              {hasProof ? "Update your payment receipt" : "Upload your payment receipt or transfer proof"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Proof Preview */}
            {hasProof && (
              <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
                <Label className="text-xs">Current Payment Proof:</Label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={order.paymentProof!} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate flex-1"
                  >
                    {order.paymentProof}
                  </a>
                  <Link href={order.paymentProof!} target="_blank">
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                {canUploadProof && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="w-full" disabled={isPending}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete Proof
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Payment Proof?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove your current payment proof. You'll need to upload a new one.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProof}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}

            {/* Upload Form */}
            <div className="space-y-2">
              <Label htmlFor="proof">Image URL {!hasProof && <span className="text-red-500">*</span>}</Label>
              <Input
                id="proof"
                type="url"
                placeholder="https://imgur.com/your-image.jpg"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                disabled={!canUploadProof || isPending}
              />
              <p className="text-xs text-muted-foreground">
                Upload to{" "}
                <a href="https://imgur.com" target="_blank" className="text-blue-600 hover:underline">
                  imgur.com
                </a>{" "}
                or{" "}
                <a href="https://imgbb.com" target="_blank" className="text-blue-600 hover:underline">
                  imgbb.com
                </a>
                , then paste the direct image URL
              </p>
            </div>

            <Button
              onClick={handleUploadProof}
              disabled={!canUploadProof || isPending || !proofUrl.trim()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isPending ? "Uploading..." : hasProof ? "Update Proof" : "Upload Proof"}
            </Button>

            {/* Help Section */}
            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-semibold">Need Help?</p>
              <Link href={whatsappLink} target="_blank" className="block">
                <Button variant="outline" className="w-full" size="sm">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Contact Admin via WhatsApp
                </Button>
              </Link>
              {canUploadProof && !hasProof && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                      Cancel Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Your order will be marked as rejected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive hover:bg-destructive/90">
                        Cancel Order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Process</CardTitle>
          <CardDescription>Follow these steps to complete your order</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              <div className="space-y-1">
                <p className="font-medium">Complete Bank Transfer</p>
                <p className="text-sm text-muted-foreground">Transfer the exact amount to the account above</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              <div className="space-y-1">
                <p className="font-medium">Upload Payment Proof</p>
                <p className="text-sm text-muted-foreground">Upload your transfer receipt to imgur.com or imgbb.com, then paste the URL above</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
              <div className="space-y-1">
                <p className="font-medium">Wait for Verification</p>
                <p className="text-sm text-muted-foreground">Admin will verify your payment within 1-24 hours</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
              <div className="space-y-1">
                <p className="font-medium">Receive Access Token</p>
                <p className="text-sm text-muted-foreground">Once confirmed, your token will be available in the dashboard</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Back to Dashboard */}
      <div className="flex justify-center">
        <Link href="/dashboard">
          <Button variant="outline" size="lg">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}