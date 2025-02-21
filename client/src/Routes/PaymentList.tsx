import * as React from 'react'
import { Link, LinkProps } from 'react-router'

import { styled } from '@mui/material/styles'

import adminOnly from '../hoc/adminOnly'
import Layout from '../components/Layout'
import LoadingScreen from '../components/LoadingScreen'
import Payments from '../components/Payments'
import ResponsiveContainer from '../components/ResponsiveContainer'
import { Payment } from '../models'
import { fetchJsonAuth, ErrorResponse, SuccessResponse, isErrorResponse } from '../utils'

import Pagination from '../components/pagination'
import { MakeOptional } from '../utils/types'
import useAuth from '../hooks/useAuth'
import Auth from '../Auth'

interface PaymentPageResponse {
  payments: Payment[]
  totalCount: number
}

type Props = {
  auth: Auth
}

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
      props.auth,
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

      payment.deletedAt = (new Date).toISOString()

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
      return <Link to='/' ref={ref} {...props} />
    },
  )

  renderPagination = () => (
    <StyledPagination
      limit={ITEMS_PER_PAGE}
      offset={this.state.offset}
      total={this.state.totalCount}
      onClick={this.handlePageChange}
      disabled={this.state.disablePagination}
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

const StyledPagination = styled(Pagination)({
  textAlign: 'center',
})

const PaymentListWrapper = () => {
  const auth = useAuth()

  return <PaymentList auth={auth} />
}

export default adminOnly(PaymentListWrapper)
