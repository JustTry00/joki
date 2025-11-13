"use server"

export async function generateToken(): Promise<string> {
  // Use Web Crypto API for browser compatibility
  if (typeof window !== "undefined") {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  // Use Node crypto in server environment
  const nodeCrypto = await import("crypto")
  return nodeCrypto.randomBytes(32).toString("hex")
}

export async function generateSecureId(): Promise<string> {
  // Use built-in crypto.randomUUID if available
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback to Node crypto
  const nodeCrypto = await import("crypto")
  return nodeCrypto.randomUUID()
}
