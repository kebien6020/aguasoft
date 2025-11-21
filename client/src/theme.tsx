import { createTheme } from '@mui/material/styles'
import { esES } from '@mui/x-date-pickers/locales'

const theme = createTheme({
  cssVariables: {
    nativeColor: true,
  },
  palette: {
    mode: 'light',
    primary: {
      light: '#63a3ff',
      main: '#1775d1',
      dark: '#004a9f',
      contrastText: '#fff',
    },
    secondary: {
      light: '#60ad5e',
      main: '#2e7d32',
      dark: '#005005',
      contrastText: '#fff',
    },
    text: {
      secondary: 'rgba(0,0,0,0.65)',
    },
  },
  typography: {
    htmlFontSize: 10, // This makes the font really big
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        sizeSmall: {
          padding: '20px 16px 20px 8px',
          fontSize: '16px',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: '1.8rem',
        },
      },
    },
  },
}, esES)

export default theme

export type Theme = typeof theme
