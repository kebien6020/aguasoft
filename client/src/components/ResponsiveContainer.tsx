import * as React from 'react'
import clsx from 'clsx'

import { makeStyles } from '@material-ui/core/styles'

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  variant?: 'normal' | 'wide'
  children?: React.ReactNode | React.ReactNodeArray
  className?: string
}
export type ResponsiveContainerProps = Props

function ResponsiveContainer(props: Props): JSX.Element {
  const { className, variant, ...other } = props
  const classes = useStyles()
  const variantClass = classes[variant ?? 'normal']
  return (
    <div
      className={clsx(variantClass, classes.common, className)}
      {...other}
    />
  )
}

const useStyles = makeStyles(theme => ({
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
  },
}))

export default ResponsiveContainer
