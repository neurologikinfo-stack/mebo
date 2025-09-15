import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-20 w-full bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold">Dashboard Admin</h1>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
