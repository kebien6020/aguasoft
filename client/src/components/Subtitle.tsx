import type { JSX } from 'react'
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

import {
  Typography,
} from '@mui/material'
import { TypographyProps } from '@mui/material/Typography'

import makeStyles from '@mui/styles/makeStyles'

type DivProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
interface TitleProps extends DivProps {
  TypographyProps?: TypographyProps
  className?: string
  children?: ReactNode
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
