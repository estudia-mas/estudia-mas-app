import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

import SessionLoading from './SessionLoading'
import { getGuestRouteDecision } from '../utils/authRoutes'
import type { RootState } from '../store'

type Props = {
  children: React.ReactNode
}

export default function GuestOnlyRoute({ children }: Props) {
  const location = useLocation()
  const isAuthenticated = useSelector(
    (s: RootState) => s.auth.isAuthenticated,
  )
  const isLoading = useSelector((s: RootState) => s.auth.isLoading)
  const user = useSelector((s: RootState) => s.auth.user)

  const decision = getGuestRouteDecision(
    { isLoading, isAuthenticated, user },
    location.pathname,
    location.search,
  )

  if (decision.status === 'loading') {
    return <SessionLoading />
  }

  if (decision.status === 'redirect') {
    return <Navigate to={decision.to} replace />
  }

  return <>{children}</>
}
