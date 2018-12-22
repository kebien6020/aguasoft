import * as React from 'react'

import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

interface ResponsiveContainerProps extends PropClasses {
  variant?: 'normal' | 'wide'
  children?: JSX.Element | JSX.Element[]
}

function ResponsiveContainer(props: ResponsiveContainerProps) {
  let className : string = props.classes[props.variant || 'normal']
  className += ' ' + props.classes.common
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

const styles : StyleRulesCallback = (theme: Theme) => ({
  normal: {
    width: '95%',
    [theme.breakpoints.up('sm')]: { width: '90%' },
    [theme.breakpoints.up('md')]: { width: '80%' },
    [theme.breakpoints.up('lg')]: { width: '70%' },
    [theme.breakpoints.up('xl')]: { width: '60%' },
  },
  wide: {
    width: '98%',
    [theme.breakpoints.up('sm')]: { width: '95%' },
    [theme.breakpoints.up('md')]: { width: '90%' },
    [theme.breakpoints.up('lg')]: { width: '85%' },
    [theme.breakpoints.up('xl')]: { width: '80%' },
  },
  common: {
    marginLeft: 'auto',
    marginRight: 'auto',
  }
})

export default withStyles(styles)(ResponsiveContainer)
