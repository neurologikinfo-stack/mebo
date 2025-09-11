"use client";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* 🔹 eliminamos max-w-7xl y mx-auto */}
      <main className="flex-1 w-full p-6">{children}</main>
    </div>
  );
}
