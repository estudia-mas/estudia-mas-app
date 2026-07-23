import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

import SessionLoading from './SessionLoading'
import type { RootState } from '../store'

type Props = {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const location = useLocation()
  const isAuthenticated = useSelector(
    (s: RootState) => s.auth.isAuthenticated,
  )
  const isLoading = useSelector((s: RootState) => s.auth.isLoading)
  const user = useSelector((s: RootState) => s.auth.user)

  if (isLoading || (isAuthenticated && user === null)) {
    return <SessionLoading />
  }

  if (!isAuthenticated || !user?.is_active) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return <>{children}</>
}
