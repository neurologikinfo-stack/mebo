"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // Rol actual (default customer)
  const role = (user?.publicMetadata?.role || "customer").toLowerCase();

  // 🔹 Rutas dinámicas de dashboard
  const dashboardRoutes = {
    customer: "/dashboard/customer",
    owner: "/dashboard/owner",
    admin: "/dashboard/admin",
  };

  const dashboardPath = dashboardRoutes[role] || "/dashboard";

  // Texto dinámico del link de dashboard
  const dashboardLabel =
    role === "customer"
      ? "Mis citas"
      : role === "owner"
      ? "Panel de negocios"
      : role === "admin"
      ? "Dashboard"
      : "Dashboard";

  const isActive = (href) =>
    pathname.startsWith(href)
      ? "text-black font-semibold"
      : "text-gray-600 hover:text-black";

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        {/* Brand */}
        <Link href="/" className="text-lg font-bold">
          mebo
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className={`text-sm ${isActive("/")}`}>
            Inicio
          </Link>
          <SignedIn>
            <Link
              href={dashboardPath}
              className={`text-sm ${isActive(dashboardPath)}`}
            >
              {dashboardLabel}
            </Link>
          </SignedIn>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3 min-w-[200px] justify-end">
          <SignedOut>
            <SignInButton mode="modal">
              <span className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer">
                Ingresar
              </span>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/book"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500 shadow"
            >
              Book
            </Link>

            {role === "admin" && (
              <Link
                href="/dashboard/admin/business/new"
                className="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:bg-black/90"
              >
                + Nuevo negocio
              </Link>
            )}

            <div className="w-8 h-8 flex items-center justify-center">
              <UserButton
                afterSignOutUrl="/"
                userProfileMode="navigation"
                userProfileUrl="/account" // 👈 ahora abre dentro de tu app
              />
            </div>
          </SignedIn>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white shadow-inner">
          <div className="flex flex-col p-4 gap-4">
            <Link href="/" className={`text-sm ${isActive("/")}`}>
              Inicio
            </Link>

            <SignedIn>
              <Link
                href={dashboardPath}
                className={`text-sm ${isActive(dashboardPath)}`}
              >
                {dashboardLabel}
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <span className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 w-full text-left cursor-pointer">
                  Ingresar
                </span>
              </SignInButton>

              <SignUpButton mode="modal">
                <span className="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:bg-black/90 w-full text-left cursor-pointer">
                  Crear cuenta
                </span>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/book"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500 shadow text-center"
              >
                Book
              </Link>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
}
