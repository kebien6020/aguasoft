import type { JSX } from 'react'
import MuiCollapse, { CollapseProps } from '@mui/material/Collapse'
import Grid, { Grid2Props as GridProps } from '@mui/material/Grid2'
import makeStyles from '@mui/styles/makeStyles'
import { ForwardedRef, forwardRef } from 'react'

const GridItemXs12 = forwardRef((props: GridProps, ref: ForwardedRef<HTMLDivElement>) =>
  <Grid size={{ xs: 12 }} {...props} ref={ref} />,
)
GridItemXs12.displayName = 'GridItemXs12'

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
