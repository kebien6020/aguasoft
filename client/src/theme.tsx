import { createMuiTheme } from 'material-ui/styles'

export default createMuiTheme({
  palette: {
    type: 'light',
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
  },
  typography: {
    htmlFontSize: 10 // This makes the font really big
  },
  overrides: {
    MuiTableCell: {
     paddingDense: {
       padding: '20px 16px 20px 8px',
       fontSize: '16px',
     },
    },
  },
})
