import { Box, CircularProgress, Typography } from '@mui/material'

type Props = {
  message?: string
}

export default function SessionLoading({
  message = 'Comprobando sesión…',
}: Props) {
  return (
    <Box
      sx={{
        minHeight: '40vh',
        display: 'grid',
        placeItems: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  )
}
