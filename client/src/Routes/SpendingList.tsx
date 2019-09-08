import * as React from 'react'
import { Link } from 'react-router-dom'

import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import IconButton from '@material-ui/core/IconButton'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import BackIcon from '@material-ui/icons/ArrowBack'

import { AuthRouteComponentProps } from '../AuthRoute'
import adminOnly from '../hoc/adminOnly'
import Layout from '../components/Layout'
import LoadingScreen from '../components/LoadingScreen'
import Spendings from '../components/Spendings'
import ResponsiveContainer from '../components/ResponsiveContainer'
import { Spending } from '../models'
import { fetchJsonAuth, ErrorResponse, SuccessResponse, isErrorResponse } from '../utils'

import Pagination from 'material-ui-flat-pagination'
import * as moment from 'moment'

interface SpendingPageResponse {
  spendings: Spending[]
  totalCount: number
}

type Props = AuthRouteComponentProps<any> & PropClasses

interface State {
  spendings: Spending[] | null
  totalCount: number
  offset: number
  disablePagination: boolean
}

const ITEMS_PER_PAGE = 30

class SpendingList extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      spendings: null,
      totalCount: 0,
      offset: 0,
      disablePagination: false
    }
  }

  componentDidMount() {
    this.updateSpendings(this.state.offset)
  }

  updateSpendings = async (offset: number) => {
    const { props } = this
    const res: ErrorResponse | SpendingPageResponse = await fetchJsonAuth(
      `/api/spendings/paginate?limit=${ITEMS_PER_PAGE}&offset=${offset}`,
      props.auth
    )

    if (!isErrorResponse(res)) {
      const { spendings, totalCount } = res
      this.setState({spendings, totalCount})
    } else {
      console.error(res.error)
    }
  }

  handleDeleteSpending = async (spendingId: number) => {
    if (!this.state.spendings) return

    const { props } = this

    const result : ErrorResponse | SuccessResponse = await
      fetchJsonAuth('/api/spendings/' + spendingId, props.auth, {
        method: 'delete',
      })

    if (!isErrorResponse(result)) {
      const spendings = [...this.state.spendings]
      const spending = spendings.find(s => s.id === spendingId)

      if (!spending) {
        console.error('Trying to mutate unknown spendingId', spendingId)
        return
      }

      spending.deletedAt = moment().toISOString()

      this.setState({spendings})
    } else {
      console.error(result.error)
    }
  }

  handlePageChange = async (_event: any, offset: number) => {
    this.setState({disablePagination: true})
    await this.updateSpendings(offset)
    this.setState({offset, disablePagination: false})
  }

  renderLinkBack = React.forwardRef((props: any, ref: any) => <Link to='/' ref={ref} {...props} />)

  renderPagination = () => (
    <Pagination
      limit={ITEMS_PER_PAGE}
      offset={this.state.offset}
      total={this.state.totalCount}
      onClick={this.handlePageChange}
      disabled={this.state.disablePagination}
      className={this.props.classes.pagination}
    />
  )

  render() {
    const { props, state } = this
    const { classes } = props

    if (state.spendings === null) {
      return <LoadingScreen text='Cargando salidas...' />
    }

    return (
      <Layout>
        <AppBar position='static' className={classes.appbar}>
          <Toolbar>
            <IconButton
              className={classes.backButton}
              color='inherit'
              aria-label='Back'
              component={this.renderLinkBack}
            >
              <BackIcon />
            </IconButton>
            <Typography variant='h6' color='inherit' className={classes.title}>
              Pagos
            </Typography>
          </Toolbar>
        </AppBar>
        <ResponsiveContainer>
          {this.renderPagination()}
          <Spendings
            spendings={state.spendings}
            onDeleteSpending={this.handleDeleteSpending}
          />
          {this.renderPagination()}
        </ResponsiveContainer>
      </Layout>
    )
  }
}

const styles : StyleRulesCallback<Theme, Props> = _theme => ({
  appbar: {
    flexGrow: 1,
  },
  backButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    flexGrow: 1,
    '& h6': {
      fontSize: '48px',
      fontWeight: 400,
    },
  },
  pagination: {
    textAlign: 'center',
  }
})

export default
  adminOnly(
  withStyles(styles)(
    SpendingList))
