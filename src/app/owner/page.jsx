// /app/owner/page.jsx
import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  // 🔹 Apenas alguien entre a /admin lo redirige a /dashboard/owner
  redirect("/dashboard/owner");
}
