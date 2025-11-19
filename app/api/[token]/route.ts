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
            "Access-Control-Allow-Origin": "*", // Tetap *
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // JS yang dikirim ke client - sekarang hanya berisi URL statis
    // dan tidak lagi mengungkapkan URL GitHub langsung ke klien
    const fetchCode = `
console.log("[TokenGen] Loading ED.ENGDIS Auto-Answer...");
console.log("[TokenGen] Remaining requests: ${validation.remainingRequests}");

// Fetch script dari Next.js API route ini sendiri (bypass CORS server lain)
fetch(window.location.href)
  .then(res => {
    if (!res.ok) throw new Error("Failed to load script");
    return res.text();
  })
  .then(code => {
    // Ambil URL dari variabel yang didefinisikan di sisi server
    const scriptUrl = "${GITHUB_SCRIPT_URL}";
    // Fetch script dari GitHub melalui server untuk menghindari CORS dan bocor
    return fetch(scriptUrl);
  })
  .then(res => {
    if (!res.ok) throw new Error("Failed to load script from server");
    return res.text();
  })
  .then(code => {
    console.log("[TokenGen] Script loaded successfully!");
    eval(code); // WASPADA: eval() bisa berbahaya
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
        "Access-Control-Allow-Origin": "*", // Tetap *
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "X-Remaining-Requests": String(validation.remainingRequests ?? 0),
        "Cache-Control": "no-store",
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
          "Access-Control-Allow-Origin": "*", // Tetap *
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
      "Access-Control-Allow-Origin": "*", // Tetap *
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Cache-Control": "no-store",
    },
  });
}