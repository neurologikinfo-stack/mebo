import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/(.*)", // si quieres proteger APIs privadas
  ],
};
