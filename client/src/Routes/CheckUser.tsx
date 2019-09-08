import * as React from 'react'
import { Redirect } from 'react-router-dom'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import Modal from '@material-ui/core/Modal'

import Layout from '../components/Layout'
import { AuthRouteComponentProps } from '../AuthRoute'
import Login from '../components/Login'
import { parseParams } from '../utils'

const styles: StyleRulesCallback<Theme, CheckUserProps> =
  ({ palette, spacing, shadows }) => ({
    paper: {
      position: 'absolute',
      width: '80%',
      backgroundColor: palette.background.paper,
      boxShadow: shadows[5],
      padding: spacing(4),
      left: '50%',
      top: '50%',
      transform: 'translateX(-50%) translateY(-50%)'
    },
    field: {
      marginTop: spacing(2),
    },
    title: {
      marginBottom: spacing(4),
    },
    button: {
      marginTop: spacing(4),
    },
  })

interface CheckUserProps extends PropClasses, AuthRouteComponentProps<{}> {

}

interface CheckUserState {
  checked: boolean
}

class CheckUser extends React.Component<CheckUserProps, CheckUserState> {

  constructor(props: CheckUserProps) {
    super(props)

    this.state = {
      checked: false,
    }
  }

  render() {
    const { props, state } = this
    const { classes } = props
    const params = parseParams(window.location.search)
    const redirectUrl = params.next ? params.next : '/sell'
    const adminOnly = params.admin ? params.admin === 'true' : false

    if (state.checked) {
      return <Redirect to={redirectUrl} push />
    }

    return (
      <Layout>
        <Modal
          open={true}
        >
          <div className={classes.paper}>
            <Login
              auth={props.auth}
              adminOnly={adminOnly}
              onSuccess={() => this.setState({checked: true})}
              text='Continuar'
            />
          </div>
        </Modal>
      </Layout>
    )
  }
}

export default withStyles(styles)(CheckUser)
