import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isOnAdmin = nextUrl.pathname.startsWith("/admin")
  const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
  const isOnAuth = nextUrl.pathname.startsWith("/auth")

  // Redirect logged in users away from auth pages
  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Protect admin routes
  if (isOnAdmin) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl))
    }
    if (req.auth?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
  }

  // Protect dashboard routes
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
