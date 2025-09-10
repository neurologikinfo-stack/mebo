import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const { userId, sessionId, sessionClaims } = auth();
  console.log("🟢 auth() →", { userId, sessionId, sessionClaims });

  if (!userId) {
    console.log("❌ No hay sesión → redirigiendo a /sign-in");
    redirect("/sign-in");
  }

  const user = await currentUser();
  console.log("🟢 currentUser() →", {
    id: user?.id,
    email: user?.primaryEmailAddress?.emailAddress,
    role: user?.publicMetadata?.role,
  });

  const role = (user?.publicMetadata?.role || "customer").toLowerCase();

  if (role === "admin") {
    console.log("➡️ Redirigiendo a /dashboard/admin");
    redirect("/dashboard/admin");
  } else if (role === "owner") {
    console.log("➡️ Redirigiendo a /dashboard/owner");
    redirect("/dashboard/owner");
  } else {
    console.log("➡️ Redirigiendo a /dashboard/customer");
    redirect("/dashboard/customer");
  }
}
