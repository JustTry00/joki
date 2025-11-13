import { type NextRequest, NextResponse } from "next/server"
import { validateAndUseToken } from "@/lib/actions/token-actions"

const GITHUB_SCRIPT_URL =
  "https://raw.githubusercontent.com/GrowthToBetter/training-for-competition/refs/heads/master/bundle.js"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params
    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Validate token and track usage
    const validation = await validateAndUseToken(token, ipAddress, userAgent)

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 401 })
    }

    // Return the GitHub fetch code that user will eval
    const fetchCode = `
// ED.ENGDIS Auto-Answer Token: ${token}
// Remaining requests: ${validation.remainingRequests}
console.log("[TokenGen] Loading ED.ENGDIS Auto-Answer...");
console.log("[TokenGen] Remaining requests: ${validation.remainingRequests}");

fetch("${GITHUB_SCRIPT_URL}")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load script");
    return res.text();
  })
  .then(code => {
    console.log("[TokenGen] Script loaded successfully!");
    eval(code);
  })
  .catch(err => {
    console.error("[TokenGen] Error loading script:", err);
    alert("Failed to load ED.ENGDIS Auto-Answer. Please try again or contact support.");
  });
`.trim()

    // Return as JavaScript with CORS headers
    return new NextResponse(fetchCode, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "X-Remaining-Requests": validation.remainingRequests?.toString() || "0",
      },
    })
  } catch (error) {
    console.error("Token API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
