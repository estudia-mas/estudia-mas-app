import { Box, Button, Stack, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { logoutUser } from '../features/auth/authSlice'
import type { AppDispatch, RootState } from '../store'

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((s: RootState) => s.auth.user)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        bgcolor: 'background.default',
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
          Estudia Más
        </Typography>
        <Typography color="text.secondary">
          Hola{user?.first_name ? `, ${user.first_name}` : ''}. Ya estás dentro —
          aquí construiremos la app.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            void dispatch(logoutUser())
          }}
        >
          Cerrar sesión
        </Button>
      </Stack>
    </Box>
  )
}
