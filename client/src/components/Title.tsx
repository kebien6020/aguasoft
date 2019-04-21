import * as React from 'react'

import {
  Typography
} from '@material-ui/core'
import { TypographyProps } from '@material-ui/core/Typography'

import {
  withStyles,
  StyleRules,
} from '@material-ui/core/styles'

interface Props extends PropClasses {
  children: any
  className?: string
  TypographyProps?: TypographyProps
}

const Title = (props: Props) => (
  <div className={[props.classes.title, props.className].join(' ')}>
    <Typography variant='h6' {...props.TypographyProps}>{props.children}</Typography>
  </div>
)

const styles: StyleRules = {
  title: {
    '& > *': {
      textAlign: 'center',
    },
  },
}

export default withStyles(styles)(Title)
