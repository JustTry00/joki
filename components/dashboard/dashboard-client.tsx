"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Package,
  Key,
  Clock,
  CheckCircle2,
  Code2,
  ExternalLink,
  Plus,
} from "lucide-react";
import type { Session } from "next-auth";

interface Token {
  id: string;
  token: string;
  requests: number;
  maxRequests: number;
  active: boolean;
  expiresAt: Date | null;
  order: {
    tier: {
      name: string;
    };
  };
}

interface Order {
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
}

interface DashboardClientProps {
  session: Session;
  orders: Order[];
  tokens: Token[];
}

export default function DashboardClient({
  session,
  orders,
  tokens,
}: DashboardClientProps) {
  const activeTokens = tokens.filter((t) => t.active && t.requests > 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">TokenGen</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/docs">
              <Button variant="ghost" size="sm">
                Docs
              </Button>
            </Link>
            {session.user.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tokens
              </CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTokens.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"> 
                {orders.filter((o) => o.status === "CONFIRMED").length} 
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Tokens */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Active Tokens</CardTitle>
                <CardDescription>Manage your API access tokens</CardDescription>
              </div>
              <Link href="/docs">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  How to Use
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {activeTokens.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You don't have any active tokens yet
                </p>
                <Link href="/#pricing">
                  <Button>Purchase a Plan</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTokens.map((token) => (
                  <div key={token.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary">
                          {token.order.tier.name}
                        </Badge>
                        {token.active && (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {token.requests} / {token.maxRequests} requests left
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-2 font-semibold">
                        Your Usage Code:
                      </p>
                      <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                        {`fetch("${
                          process.env.NEXT_PUBLIC_APP_URL ||
                          "https://engdis-resolve.vercel.app"
                        }/api/${token.token}")
  .then(res => res.text())
  .then(code => eval(code))
  .catch(err => console.error("Error:", err))`}
                      </pre>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        💡 Kode ini akan validate token dan auto-fetch script
                        terbaru dari GitHub
                      </p>
                    </div>

                    <div className="bg-muted p-3 rounded font-mono text-sm break-all mb-2">
                      {token.token}
                    </div>

                    <div className="flex items-center justify-between">
                      {token.expiresAt && (
                        <p className="text-xs text-muted-foreground">
                          Expires:{" "}
                          {new Date(token.expiresAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `fetch("${
                              process.env.NEXT_PUBLIC_APP_URL ||
                              "https://engdis-resolve.vercel.app"
                            }/api/${
                              token.token
                            }").then(res => res.text()).then(code => eval(code)).catch(err => console.error("Error:", err))`
                          );
                        }}>
                        Copy Code
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <CardTitle className="text-xl font-semibold">
                Recent Orders
              </CardTitle>
              <CardDescription className="text-sm">
                Track your latest order activity
              </CardDescription>
            </div>

            <Link href="/pricing">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Order
              </Button>
            </Link>
          </div>

          <CardContent className="p-0">
            {orders.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <p className="text-sm">Belum ada order yang masuk</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="
              flex items-center justify-between 
              p-4 border rounded-lg
              hover:bg-muted/40 
              transition-colors
            ">
                    <div>
                      <p className="font-medium">{order.tier.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        Rp{order.totalPrice.toLocaleString("id-ID")}
                      </span>

                      {order.status === "PENDING" && (
                        <Badge variant="outline" className="text-yellow-600">
                          Pending
                        </Badge>
                      )}

                      {order.status === "CONFIRMED" && (
                        <Badge className="bg-green-600 text-white">
                          Confirmed
                        </Badge>
                      )}

                      {order.status === "REJECTED" && (
                        <Badge variant="destructive">Rejected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
