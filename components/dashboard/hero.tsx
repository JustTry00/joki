import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Code2, Shield, Zap } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getTiers() {
  const tiers = await prisma.tier.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  })
  return tiers
}

export default async function HomePage() {
  const tiers = await getTiers()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">TokenGen</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6" variant="outline">
            ED.ENGDIS Auto-Answer System
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Auto-Answer Tokens for ED.ENGDIS</h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Secure access tokens for ED.ENGDIS auto-answer script. Get instant access with flexible pricing tiers.
            Complete exercises automatically with our advanced solution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#pricing">
              <Button size="lg" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
            <Link href="#docs">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Our Service?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Instant Auto-Fill</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically detects and fills correct answers in real-time. Works with all question formats
                  including text, multiple choice, and images.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Encrypted token system with usage tracking. Each token is unique and secure, protecting your access
                  rights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code2 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Easy Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Just one line of code to activate. Copy your token, paste the code in browser console, and you're
                  ready to go.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section id="docs" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Simple Integration</h2>
          <p className="text-center text-muted-foreground mb-12">
            Get started in seconds. Just paste this code in your browser console while on ED.ENGDIS
          </p>
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle className="font-mono text-sm">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">1. Open ED.ENGDIS learning page</p>
                <p className="text-sm text-muted-foreground mb-2">
                  2. Open browser console (F12 or Right Click → Inspect → Console)
                </p>
                <p className="text-sm text-muted-foreground mb-4">3. Paste your token code:</p>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className="text-sm font-mono text-foreground">{`fetch("${baseUrl}/[YOUR_TOKEN]")
  .then(res => res.text())
  .then(code => eval(code))
  .catch(err => console.error("Error:", err))`}</code>
              </pre>
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-semibold mb-2">What happens after injection:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Script automatically fetches latest code from GitHub</li>
                  <li>Auto-detects questions and displays correct answers in a draggable box</li>
                  <li>Click any answer to auto-fill forms instantly</li>
                  <li>Supports multiple choice, fill-in-blank, and image questions</li>
                  <li>Refresh button to reload answers if needed</li>
                  <li>Each injection counts as 1 request from your token limit</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Plans and Pricing</h2>
          <p className="text-center text-muted-foreground mb-12">
            Choose the perfect plan for your needs. All plans include email support.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card key={tier.id} className={tier.popular ? "border-primary border-2 relative" : ""}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Rp{tier.price.toLocaleString("id-ID")}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={`/checkout?tier=${tier.id}`} className="w-full">
                    <Button className="w-full" variant={tier.popular ? "default" : "outline"} size="lg">
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-primary text-primary-foreground rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join students who use our service to complete ED.ENGDIS exercises efficiently
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary">
              Get Your Token
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">TokenGen</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 TokenGen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
