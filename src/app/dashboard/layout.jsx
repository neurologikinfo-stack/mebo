"use client";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <main className="flex-1 w-full max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}
