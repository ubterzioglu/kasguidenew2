import { AdminSidebarActionsProvider } from './AdminSidebarActionsContext'
import AdminSidebar from './AdminSidebar'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSidebarActionsProvider>
      <div className="admin-dashboard-shell">
        <AdminSidebar />
        <div className="admin-dashboard-content">{children}</div>
      </div>
    </AdminSidebarActionsProvider>
  )
}
