import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

import GuestOnlyRoute from './components/GuestOnlyRoute'
import ProtectedRoute from './components/ProtectedRoute'
import { checkAndRefreshToken } from './features/auth/authSlice'
import ActivatePage from './pages/auth/ActivatePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ResetPasswordConfirmPage from './pages/auth/ResetPasswordConfirmPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import HomePage from './pages/HomePage'
import type { AppDispatch } from './store'

const theme = createTheme({
  palette: {
    primary: { main: '#CA3C60' },
    secondary: { main: '#802F42' },
    background: { default: '#F3F3F1', paper: '#ffffff' },
    text: { primary: '#802F42', secondary: '#6F3D47' },
  },
  typography: {
    fontFamily:
      '"Inter", "DM Sans", "Segoe UI", system-ui, -apple-system, sans-serif',
    h3: { fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
})

export default function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    void dispatch(checkAndRefreshToken())
  }, [dispatch])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route
          path="/"
          element={
            <GuestOnlyRoute>
              <Navigate to="/login" replace />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <LoginPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/registro"
          element={
            <GuestOnlyRoute>
              <RegisterPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/recuperar-contrasena"
          element={
            <GuestOnlyRoute>
              <ResetPasswordPage />
            </GuestOnlyRoute>
          }
        />
        <Route path="/activate/:uid/:token/" element={<ActivatePage />} />
        <Route
          path="/password/reset/confirm/:uid/:token/"
          element={<ResetPasswordConfirmPage />}
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
