import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, BookOpen, Zap, Shield, Terminal, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">TokenGen</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              Documentation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Complete Guide</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about using TokenGen for ED.ENGDIS
            </p>
          </div>

          {/* Quick Start */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Quick Start</CardTitle>
              </div>
              <CardDescription>Get up and running in 3 simple steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Purchase a Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a pricing tier that fits your needs and complete the payment via WhatsApp
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Wait for Confirmation</h3>
                    <p className="text-sm text-muted-foreground">
                      Admin will verify your payment and send your access token via email
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Use Your Token</h3>
                    <p className="text-sm text-muted-foreground">
                      Open ED.ENGDIS, paste the code in browser console, and start auto-answering!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                <CardTitle>How to Use Your Token</CardTitle>
              </div>
              <CardDescription>Step-by-step guide to activate the auto-answer script</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Step 1: Open ED.ENGDIS
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6">
                    Navigate to any learning page on ED.ENGDIS where you have questions to answer.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Step 2: Open Browser Console
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6 mb-2">
                    Open developer tools using one of these methods:
                  </p>
                  <ul className="text-sm text-muted-foreground ml-6 space-y-1 list-disc list-inside">
                    <li>Press F12 key</li>
                    <li>Right-click anywhere and select "Inspect" or "Inspect Element"</li>
                    <li>Press Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)</li>
                  </ul>
                  <p className="text-sm text-muted-foreground ml-6 mt-2">Then click on the "Console" tab.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Step 3: Paste Your Code
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6 mb-3">
                    Copy the code from your email and paste it in the console:
                  </p>
                  <div className="ml-6">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{`fetch("https://your-domain.com/[YOUR_TOKEN]")
  .then(res => res.text())
  .then(code => eval(code))
  .catch(err => console.error("Error:", err))`}</code>
                    </pre>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6 mt-3">Press Enter to execute the code.</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 ml-6 mt-2 font-semibold">
                    💡 This code validates your token and automatically fetches the latest script from GitHub
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Step 4: Script Auto-Loads
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6 mb-2">After token validation, the system will:</p>
                  <ul className="text-sm text-muted-foreground ml-6 space-y-1 list-disc list-inside">
                    <li>Fetch the latest auto-answer script from GitHub repository</li>
                    <li>Load and execute the script automatically</li>
                    <li>Display console messages showing loading progress</li>
                    <li>Show your remaining request count</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Step 5: Use the Answer Box
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6 mb-2">
                    A floating answer box will appear showing all correct answers:
                  </p>
                  <ul className="text-sm text-muted-foreground ml-6 space-y-1 list-disc list-inside">
                    <li>Click any answer to auto-fill the form</li>
                    <li>Use refresh button to reload answers</li>
                    <li>Drag the box to reposition it</li>
                    <li>Minimize or close when not needed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Features</CardTitle>
              </div>
              <CardDescription>What the auto-answer script can do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Supported Question Types</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Multiple choice questions</li>
                    <li>✓ Fill-in-the-blank</li>
                    <li>✓ Dropdown selections</li>
                    <li>✓ Image-based questions</li>
                    <li>✓ Multiple correct answers</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">User Interface</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Draggable answer box</li>
                    <li>✓ Click to auto-fill</li>
                    <li>✓ Copy answers to clipboard</li>
                    <li>✓ Minimize/maximize controls</li>
                    <li>✓ Refresh answers manually</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security & Best Practices</CardTitle>
              </div>
              <CardDescription>Important information about using your token safely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 text-yellow-900 dark:text-yellow-200">⚠️ Token Security</h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                  <li>• Never share your token with anyone</li>
                  <li>• Each request is tracked and counted</li>
                  <li>• Token will expire after reaching request limit</li>
                  <li>• Check your dashboard regularly for usage stats</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-200">💡 Pro Tips</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Bookmark your token code for quick access</li>
                  <li>• Use browser console snippets to save the code</li>
                  <li>• Monitor remaining requests in dashboard</li>
                  <li>• Contact support if you encounter any issues</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">What happens when I run out of requests?</h4>
                <p className="text-sm text-muted-foreground">
                  Your token will become inactive and you'll need to purchase a new plan to continue using the service.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Can I use the same token on multiple devices?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, but remember that each use counts toward your total request limit regardless of device.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">How long does payment confirmation take?</h4>
                <p className="text-sm text-muted-foreground">
                  Usually within a few hours during business hours. You'll receive your token via email once confirmed.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">What if the script doesn't work?</h4>
                <p className="text-sm text-muted-foreground">
                  Make sure you're on the correct ED.ENGDIS page, have pasted the code correctly in the console, and
                  your token is still active. Contact support if issues persist.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center bg-muted rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">Choose a plan and start auto-answering today</p>
            <Link href="/#pricing">
              <Button size="lg">View Pricing Plans</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
