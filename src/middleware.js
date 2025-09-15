import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/book/:path*", // 👈 protege /book y subrutas
    "/api/(.*)", // protege APIs privadas
  ],
};
