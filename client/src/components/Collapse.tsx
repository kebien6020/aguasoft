import type { JSX } from 'react'
import MuiCollapse, { CollapseProps } from '@mui/material/Collapse'
import Grid, { GridProps } from '@mui/material/Grid'
import makeStyles from '@mui/styles/makeStyles'

const GridItemXs12 = (props: GridProps) => (
  <Grid size={{ xs: 12 }} {...props} />
)

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
