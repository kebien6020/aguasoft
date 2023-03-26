import * as React from 'react'

import MuiCollapse, { CollapseProps } from '@material-ui/core/Collapse'
import Grid, { GridProps } from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'

const GridItemXs12 = (props: GridProps) => <Grid item xs={12} {...props} />

const Collapse = (props: CollapseProps): JSX.Element => {
  const classes = useCollapseStyles()
  return (
    <MuiCollapse
      component={GridItemXs12}
      classes={{
        hidden: classes.hidden,
        wrapper: classes.container,
      }}
      {...props}
    >
      <Grid container spacing={2}>
        {props.children}
      </Grid>
    </MuiCollapse>
  )
}

const useCollapseStyles = makeStyles({
  hidden: {
    padding: '0 !important',
  },
  container: {
    transitionProperty: 'height, padding',
  },
})

export default Collapse
