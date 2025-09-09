import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await currentUser();
    const role = user?.publicMetadata?.role;

    if (role) {
      // Ya tiene rol asignado
      return NextResponse.json({ success: true, role });
    }

    // Si no tiene rol, asignamos "customer" por defecto
    await fetch(`https://api.clerk.dev/v1/users/${userId}/metadata`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`, // 🔑
      },
      body: JSON.stringify({
        public_metadata: { role: "customer" },
      }),
    });

    return NextResponse.json({ success: true, role: "customer" });
  } catch (err) {
    console.error("❌ Error asignando rol:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
