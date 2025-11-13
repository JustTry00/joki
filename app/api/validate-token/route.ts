import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token is required" }, { status: 400 })
    }

    const tokenData = await prisma.token.findUnique({
      where: { token },
      select: {
        active: true,
        requests: true,
        maxRequests: true,
        expiresAt: true,
      },
    })

    if (!tokenData) {
      return NextResponse.json({
        valid: false,
        error: "Invalid token",
      })
    }

    if (!tokenData.active) {
      return NextResponse.json({
        valid: false,
        error: "Token is inactive",
      })
    }

    if (tokenData.requests <= 0) {
      return NextResponse.json({
        valid: false,
        error: "No remaining requests",
      })
    }

    if (tokenData.expiresAt && tokenData.expiresAt < new Date()) {
      return NextResponse.json({
        valid: false,
        error: "Token has expired",
      })
    }

    return NextResponse.json({
      valid: true,
      remainingRequests: tokenData.requests,
      maxRequests: tokenData.maxRequests,
      expiresAt: tokenData.expiresAt,
    })
  } catch (error) {
    console.error("Validate token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
