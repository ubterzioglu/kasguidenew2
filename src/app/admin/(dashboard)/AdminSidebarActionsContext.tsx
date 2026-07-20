'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type RefreshAction = {
  label: string
  refreshing: boolean
  onRefresh: () => void
}

type AdminSidebarActionsContextValue = {
  refreshAction: RefreshAction | null
  setRefreshAction: (action: RefreshAction | null) => void
}

const AdminSidebarActionsContext = createContext<AdminSidebarActionsContextValue | null>(null)

export function AdminSidebarActionsProvider({ children }: { children: React.ReactNode }) {
  const [refreshAction, setRefreshAction] = useState<RefreshAction | null>(null)

  const value = useMemo(
    () => ({ refreshAction, setRefreshAction }),
    [refreshAction],
  )

  return (
    <AdminSidebarActionsContext.Provider value={value}>
      {children}
    </AdminSidebarActionsContext.Provider>
  )
}

function useAdminSidebarActionsContext(): AdminSidebarActionsContextValue {
  const context = useContext(AdminSidebarActionsContext)

  if (!context) {
    throw new Error('useAdminSidebarActionsContext must be used within AdminSidebarActionsProvider')
  }

  return context
}

export function useAdminSidebarRefreshAction(action: RefreshAction | null): void {
  const { setRefreshAction } = useAdminSidebarActionsContext()

  useEffect(() => {
    setRefreshAction(action)

    return () => setRefreshAction(null)
    // action is a fresh object every render by design (label/refreshing/onRefresh
    // change together); comparing by identity would register on every render,
    // which is fine here since setRefreshAction only updates state when the
    // reference actually changes are cheap no-ops for React.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action?.label, action?.refreshing, action?.onRefresh])
}

export function useAdminSidebarRefreshState(): RefreshAction | null {
  const { refreshAction } = useAdminSidebarActionsContext()
  return refreshAction
}
