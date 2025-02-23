import Card from '@mui/material/Card'
import { Theme } from '../../../theme'
import { styled } from '@mui/material/styles'

const SummaryCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  borderLeftWidth: '4px',
  borderLeftStyle: 'solid',
  borderLeftColor: theme.palette.primary.main,
  height: '100%',
  marginBottom: '1rem',
}))

export default SummaryCard
