import {
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
} from '@mui/material'
import Layout from '../../components/Layout'
import { LocalAtm, Refresh } from '@mui/icons-material'
import { Link } from 'react-router'
import ResponsiveContainer from '../../components/ResponsiveContainer'
import { usePriceSets } from '../../hooks/api/usePriceSets'
import { VSpace } from '../../components/utils'
import { PriceSet } from '../../models'
import { useState } from 'react'
import { HelpButton } from './components/help'
import { ItemDialog } from './components/menu'

const PriceSetList = () => {
  const [priceSets, refresh] = usePriceSets()
  return (
    <Layout
      title='Conjuntos de Precios'
      appBarExtra={<AppBarActions refresh={refresh} />}
      container={ResponsiveContainer}
    >
      <PSList
        priceSets={priceSets}
        refresh={refresh}
      />
    </Layout>
  )
}
export default PriceSetList

interface PSListProps {
  priceSets: PriceSet[] | undefined
  refresh: () => void
}

const PSList = ({ priceSets, refresh }: PSListProps) => {
  const [selectedPriceSet, setSelectedPriceSet] = useState<PriceSet | undefined>()

  const dialogOpen = Boolean(selectedPriceSet)
  const closeDialog = () => {
    setSelectedPriceSet(undefined)
  }

  const selectItem = setSelectedPriceSet

  if (!priceSets)
    return <ListSkeleton />

  return (
    <>
      <List>
        {priceSets.map((ps) => (
          <Item key={ps.id} name={ps.name} onClick={() => {
            selectItem(ps)
          }} />
        ))}
      </List>
      <ItemDialog
        open={dialogOpen}
        onClose={closeDialog}
        priceSet={selectedPriceSet}
        refresh={refresh}
      />
    </>
  )
}

interface ItemProps {
  name: string
  onClick?: () => void
}

const Item = ({ name, onClick }: ItemProps) => (
  <ListItemButton onClick={onClick}>
    <ListItemIcon> <LocalAtm /> </ListItemIcon>
    <ListItemText>{name}</ListItemText>
  </ListItemButton>
)

interface AppBarActionsProps {
  refresh: () => void
}

const AppBarActions = ({ refresh }: AppBarActionsProps) => (
  <>
    <NewButton />
    <RefreshButton refresh={refresh} />
    <HelpButton />
  </>
)

const NewButton = () => (
  <Button component={Link} to='/prices/new' color='inherit'>
    Nuevo
  </Button>
)

interface RefreshButtonProps {
  refresh: () => void
}

const RefreshButton = ({ refresh }: RefreshButtonProps) => {
  return (
    <IconButton color='inherit' onClick={refresh}>
      <Refresh />
    </IconButton>
  )
}

const ListSkeleton = () => (
  <>
    <SkeletonItem />
    <SkeletonItem />
    <SkeletonItem />
  </>
)

const SkeletonItem = () => (
  <>
    <VSpace />
    <Skeleton variant='rectangular' width='100%' height={40} />
  </>
)

