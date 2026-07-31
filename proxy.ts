import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role || "";

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    if (pathname !== "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (
    pathname.startsWith("/salesperson") &&
    !["admin", "salesperson"].includes(role)
  ) {
    if (pathname !== "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/salesperson/:path*"],
};
