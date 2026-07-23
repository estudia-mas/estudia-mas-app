import { Box, Stack } from '@mui/material'

type AuthCardProps = {
  children: React.ReactNode
  showBrand?: boolean
}

export default function AuthCard({ children, showBrand = true }: AuthCardProps) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 440,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 16px 48px rgba(128, 47, 66, 0.12)',
        px: { xs: 3, sm: 4 },
        py: { xs: 3, sm: 4 },
      }}
    >
      <Stack spacing={2.5}>
        {showBrand ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src="/brand/logo-estudia-mas.png"
              alt="Estudia Más"
              sx={{ width: 88, height: 88, objectFit: 'contain' }}
            />
          </Box>
        ) : null}
        {children}
      </Stack>
    </Box>
  )
}
