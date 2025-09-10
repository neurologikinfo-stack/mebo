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

  // Normalizamos el rol siempre a minúsculas
  const rawRole = user?.publicMetadata?.role || null;
  const role = typeof rawRole === "string" ? rawRole.toLowerCase() : null;

  // Mapeo de roles → rutas y etiquetas
  const dashboardRoutes = {
    admin: { path: "/dashboard/admin", label: "Dashboard" },
    customer: { path: "/dashboard/customer", label: "Mis citas" },
    owner: { path: "/dashboard/owner", label: "Panel de negocios" },
  };

  // Obtiene la ruta si existe, o null si no corresponde
  const current = role ? dashboardRoutes[role] || null : null;

  const isActive = (href) =>
    pathname === href
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
            {current && (
              <Link
                href={current.path}
                className={`text-sm ${isActive(current.path)}`}
              >
                {current.label}
              </Link>
            )}
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
              <UserButton afterSignOutUrl="/" userProfileMode="navigation" />
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
              {current && (
                <Link
                  href={current.path}
                  className={`text-sm ${isActive(current.path)}`}
                >
                  {current.label}
                </Link>
              )}
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

              {role === "admin" && (
                <Link
                  href="/dashboard/admin/business/new"
                  className="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:bg-black/90 text-center"
                >
                  + Nuevo negocio
                </Link>
              )}

              <div className="mt-2 w-8 h-8 flex items-center justify-center">
                <UserButton afterSignOutUrl="/" userProfileMode="navigation" />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
}
