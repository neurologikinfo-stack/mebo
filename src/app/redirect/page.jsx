import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RedirectPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 🔹 Asegurar que tenga rol por defecto
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/set-default-role`, {
    method: "POST",
  });

  const role = user.publicMetadata?.role || "customer";

  if (role === "admin") redirect("/dashboard/admin");
  else if (role === "owner") redirect("/dashboard/owner");
  else redirect("/dashboard/customer");
}
