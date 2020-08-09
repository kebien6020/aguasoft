import * as React from 'react'
import clsx from 'clsx'

import {
  Typography,
} from '@material-ui/core'
import { TypographyProps } from '@material-ui/core/Typography'

import {
  makeStyles,
} from '@material-ui/core/styles'

type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
interface TitleProps extends DivProps {
  TypographyProps?: TypographyProps
  className?: string
  children?: React.ReactNode
}

export default function Subtitle(props: TitleProps): JSX.Element {
  const { className, children, TypographyProps, ...otherProps } = props
  const classes = useTitleStyles()
  return (
    <div {...otherProps} className={clsx(classes.title, className)}>
      <Typography variant='subtitle2' {...TypographyProps}>{children}</Typography>
    </div>
  )
}

const useTitleStyles = makeStyles(theme => ({
  title: {
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(2),
    '& > *': {
      textAlign: 'center',
    },
    color: 'rgba(0,0,0,0.5)',
  },
}))
