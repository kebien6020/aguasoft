import * as React from 'react'

export default class Layout extends React.Component {
  render() {
    const { props } = this
    return (
      <React.Fragment>
        {props.children}
      </React.Fragment>
    )
  }
}
