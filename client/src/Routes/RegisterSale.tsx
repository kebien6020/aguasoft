import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'

import Button from 'material-ui/Button'
import { FormControl } from 'material-ui/Form'
import Grid from 'material-ui/Grid'
// import IconButton from 'material-ui/IconButton'
import Input, { InputLabel } from 'material-ui/Input'
import { MenuItem } from 'material-ui/Menu'
import Paper from 'material-ui/Paper'
import Select from 'material-ui/Select'
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table'
import Typography from 'material-ui/Typography'
import AddIcon from 'material-ui-icons/Add'
import RemoveIcon from 'material-ui-icons/Remove'

import Layout from '../components/Layout'
import { fetchJsonAuth } from '../utils'
import { AuthRouteComponentProps } from '../AuthRoute'

const styles: StyleRulesCallback = (theme: Theme) => ({
  title: {
    textAlign: 'center',
    paddingTop: theme.spacing.unit * 2,
  },
  paper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
    minHeight: '80vh',
    width: '90%',
    [theme.breakpoints.down('sm')]: {
      width: '98%',
    },
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
  },
  qtyCell: {
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      '& button': {
        minWidth: '24px',
      },
      '& span': {
        width: undefined,
      }
    }
  },
  numericInput: {
    width: theme.spacing.unit * 6,
    marginRight: theme.spacing.unit,
    [theme.breakpoints.down('md')]: {
      width: theme.spacing.unit * 3,
      marginRight: 0,
      fontSize: '1em',
    },
    '& input': {
      textAlign: 'center',
      '-moz-appearance': 'textfield',
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        'margin': 0,
      },
    },
  },
})

interface SqIconButtonProps { children: JSX.Element }
const SqIconButton = ({ children }: SqIconButtonProps) => (
  <Button disableRipple size='small' variant='raised' color='secondary'>
    {children}
  </Button>
)

const PlusButton = () => (
  <SqIconButton><AddIcon /></SqIconButton>
)

const MinusButton = () => (
  <SqIconButton><RemoveIcon /></SqIconButton>
)
const handleNumericFocus = (event: React.FocusEvent<HTMLDivElement>) => {
  const inputElement = event.target as any as HTMLInputElement // Trust me this is fine
  inputElement.select()
}
const NumericPicker = ({ classes }: PropClasses) => (
  <React.Fragment>
    <Input
      type='number'
      defaultValue={0}
      className={classes.numericInput}
      onFocus={handleNumericFocus}
    />
    <PlusButton /> <MinusButton />
  </React.Fragment>
)

interface RegisterSaleProps extends PropClasses, AuthRouteComponentProps<{}> {

}

interface Client {
  id: number
  code:string
  name: string
}

interface RegisterSaleState {
  clientId: number
  clients: Client[]
}

type InputEvent = React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>

class RegisterSale extends React.Component<RegisterSaleProps, RegisterSaleState> {

  constructor(props: RegisterSaleProps) {
    super(props)

    this.state = {
      clientId: null,
      clients: null,
    }
  }

  async componentWillMount() {
    const clients: Client[] = await fetchJsonAuth('/api/clients', this.props.auth)

    this.setState({clients, clientId: clients[0].id})
  }

  handleClientChange = (event: InputEvent) => {
    const clientId = event.target.value === 'none' ?
     null :
     Number(event.target.value)

    this.setState({clientId})
  }

  render() {
    const { props, state } = this
    const { classes } = props
    return (
      <Layout>
        <Paper elevation={8} className={classes.paper}>
          <Typography variant="title" className={classes.title}>
            Registrar Venta
        </Typography>
          <Grid container>
            <Grid item xs={6}>
              <FormControl fullWidth margin='normal'>
                <InputLabel htmlFor='input-user'>Usuario</InputLabel>
                <Input
                  disabled
                  value='(001) Hever'
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin='normal'>
                <InputLabel htmlFor='input-client'>Cliente</InputLabel>
                <Select
                  id='input-client'
                  fullWidth
                  value={state.clientId || 'none'}
                  onChange={this.handleClientChange}
                >
                {state.clients
                  ? state.clients.map((client, key) =>
                      <MenuItem key={key} value={client.id}>
                        ({client.code}) {client.name}
                      </MenuItem>
                    )
                  : <MenuItem value='none'>Cargando...</MenuItem>
                }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell className={classes.qtyCell}>Cantidad</TableCell>
                    <TableCell>Valor Unitario</TableCell>
                    <TableCell>Valor Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>001</TableCell>
                    <TableCell>Botellón</TableCell>
                    <TableCell className={classes.qtyCell}><NumericPicker classes={classes} /></TableCell>
                    <TableCell numeric>4000</TableCell>
                    <TableCell numeric>4000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>002</TableCell>
                    <TableCell>Bolsa 6L</TableCell>
                    <TableCell className={classes.qtyCell}><NumericPicker classes={classes} /></TableCell>
                    <TableCell numeric>1500</TableCell>
                    <TableCell numeric>1500</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Paper>
      </Layout>
    )
  }
}

export default withStyles(styles)(RegisterSale)
