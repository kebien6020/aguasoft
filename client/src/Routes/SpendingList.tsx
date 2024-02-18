import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'
import Pagination from 'material-ui-flat-pagination'
import moment from 'moment'
import * as React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { AuthRouteComponentProps } from '../AuthRoute'
import Layout from '../components/Layout'
import LoadingScreen from '../components/LoadingScreen'
import ResponsiveContainer from '../components/ResponsiveContainer'
import Spendings from '../components/Spendings'
import adminOnly from '../hoc/adminOnly'
import { Spending } from '../models'
import { ErrorResponse, fetchJsonAuth, isErrorResponse, SuccessResponse } from '../utils'
import { MakeOptional } from '../utils/types'

interface SpendingPageResponse {
  spendings: Spending[]
  totalCount: number
}

type Props = AuthRouteComponentProps & PropClasses

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
      disablePagination: false,
    }
  }

  async componentDidMount() {
    await this.updateSpendings(this.state.offset)
  }

  updateSpendings = async (offset: number) => {
    const { props } = this
    const res: ErrorResponse | SpendingPageResponse = await fetchJsonAuth(
      `/api/spendings/paginate?limit=${ITEMS_PER_PAGE}&offset=${offset}`,
      props.auth
    )

    if (!isErrorResponse(res)) {
      const { spendings, totalCount } = res
      this.setState({ spendings, totalCount })
    } else {
      console.error(res.error)
    }
  }

  handleDeleteSpending = async (spendingId: number) => {
    if (!this.state.spendings) return

    const { props } = this

    const result: ErrorResponse | SuccessResponse =
    await fetchJsonAuth(`/api/spendings/${spendingId}`, props.auth, {
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

      this.setState({ spendings })
    } else {
      console.error(result.error)
    }
  }

  handlePageChange = async (_event: unknown, offset: number) => {
    this.setState({ disablePagination: true })
    await this.updateSpendings(offset)
    this.setState({ offset, disablePagination: false })
  }

  renderLinkBack = React.forwardRef<HTMLAnchorElement, MakeOptional<LinkProps, 'to'>>(
    function BackLink(props, ref) {
      return <Link to='/' ref={ref} {...props} />
    }
  )

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
    const { state } = this

    if (state.spendings === null)
      return <LoadingScreen text='Cargando salidas...' />

    return (
      <Layout title='Lista de salidas'>
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

const styles: StyleRulesCallback<Theme, Props> = _theme => ({
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
  },
})

export default
adminOnly(
  withStyles(styles)(
    SpendingList))
