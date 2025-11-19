// 🚫 Jangan cache sama sekali — WAJIB
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server";
import { validateAndUseToken } from "@/lib/actions/token-actions";

const GITHUB_SCRIPT_URL =
  "https://raw.githubusercontent.com/GrowthToBetter/training-for-competition/refs/heads/master/bundle.js";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Ambil IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    // Validasi token
    const validation = await validateAndUseToken(token, ipAddress, userAgent);

    if (!validation.valid) {
      return new NextResponse(
        JSON.stringify({ error: validation.error }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // JS yang dikirim ke client
    const fetchCode = `
console.log("[TokenGen] Loading ED.ENGDIS Auto-Answer...");
console.log("[TokenGen] Remaining requests: ${validation.remainingRequests}");

// Tambahkan cache buster supaya TIDAK di-cache browser
fetch("${GITHUB_SCRIPT_URL}?_v=" + Date.now())
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
`.trim();

    return new NextResponse(fetchCode, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "X-Remaining-Requests": String(validation.remainingRequests ?? 0),
        "Cache-Control": "no-store", // 🚫 jangan cache sama sekali
      },
    });
  } catch (error) {
    console.error("Token API error:", error);

    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Cache-Control": "no-store",
    },
  });
}
