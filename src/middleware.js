import { clerkMiddleware } from "@clerk/nextjs/server";

// No bloquea ninguna ruta, solo deja que Clerk maneje sesiones si existen
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"], // aplica globalmente pero no redirige
};
