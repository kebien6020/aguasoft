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

type Props = AuthRouteComponentProps<any> & PropClasses

interface State {

}

class PaymentList extends React.Component<Props, State> {

  renderLinkBack = (props: any) => <Link to='/' {...props} />

  render() {
    const { props } = this
    const { classes } = props

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
      </Layout>
    )
  }
}

const styles : StyleRulesCallback = (_theme: Theme) => ({
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
})

export default
  adminOnly(
  withStyles(styles)(
    PaymentList))
