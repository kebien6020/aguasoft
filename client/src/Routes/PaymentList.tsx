import * as React from 'react'
import { Link, LinkProps } from 'react-router-dom'

import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import { AuthRouteComponentProps } from '../AuthRoute'
import adminOnly from '../hoc/adminOnly'
import Layout from '../components/Layout'
import LoadingScreen from '../components/LoadingScreen'
import Payments from '../components/Payments'
import ResponsiveContainer from '../components/ResponsiveContainer'
import { Payment } from '../models'
import { fetchJsonAuth, ErrorResponse, SuccessResponse, isErrorResponse, MakeOptional } from '../utils'

import Pagination from 'material-ui-flat-pagination'
import moment from 'moment'

interface PaymentPageResponse {
  payments: Payment[]
  totalCount: number
}

type Props = AuthRouteComponentProps<unknown> & PropClasses

interface State {
  payments: Payment[] | null
  totalCount: number
  offset: number
  disablePagination: boolean
}

const ITEMS_PER_PAGE = 30

class PaymentList extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      payments: null,
      totalCount: 0,
      offset: 0,
      disablePagination: false,
    }
  }

  componentDidMount() {
    void this.updatePayments(this.state.offset)
  }

  updatePayments = async (offset: number) => {
    const { props } = this
    const res: ErrorResponse | PaymentPageResponse = await fetchJsonAuth(
      `/api/payments/paginate?limit=${ITEMS_PER_PAGE}&offset=${offset}`,
      props.auth
    )

    if (!isErrorResponse(res)) {
      const { payments, totalCount } = res
      this.setState({ payments, totalCount })
    } else {
      console.error(res.error)
    }
  }

  handleDeletePayment = async (paymentId: number) => {
    if (!this.state.payments) return

    const { props } = this

    const result =
      await fetchJsonAuth<SuccessResponse>(`/api/payments/${paymentId}`, props.auth, {
        method: 'delete',
      })

    if (!isErrorResponse(result)) {
      const payments = [...this.state.payments]
      const payment = payments.find(p => p.id === paymentId)

      if (!payment) {
        console.error('Trying to mutate unknown paymentId', paymentId)
        return
      }

      payment.deletedAt = moment().toISOString()

      this.setState({ payments })
    } else {
      console.error(result.error)
    }
  }

  handlePageChange = async (_event: unknown, offset: number) => {
    this.setState({ disablePagination: true })
    await this.updatePayments(offset)
    this.setState({ offset, disablePagination: false })
  }

  renderLinkBack = React.forwardRef<HTMLAnchorElement, MakeOptional<LinkProps, 'to'>>(
    function HomeLink(props, ref) {
      return <Link to='/' innerRef={ref} {...props} />
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

    if (state.payments === null)
      return <LoadingScreen text='Cargando pagos...' />


    return (
      <Layout title='Todos los Pagos' container={ResponsiveContainer}>
        {this.renderPagination()}
        <Payments
          payments={state.payments}
          onDeletePayment={this.handleDeletePayment}
        />
        {this.renderPagination()}
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
  },
})

export default
adminOnly(
  withStyles(styles)(
    PaymentList))
