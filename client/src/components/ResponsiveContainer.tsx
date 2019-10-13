import * as React from 'react'
import clsx from 'clsx'

import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

interface Props {
  variant?: 'normal' | 'wide'
  children?: React.ReactNode | React.ReactNodeArray
  className?: string
}
export type ResponsiveContainerProps = Props

type AllProps = Props & PropClasses

function ResponsiveContainer(props: AllProps) {
  const { className, variant, children, classes } = props
  let variantClass : string = classes[variant || 'normal']
  return (
    <div className={clsx(variantClass, classes.common, className)}>
      {children}
    </div>
  )
}

const styles : StyleRulesCallback<Theme, Props> = theme => ({
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
