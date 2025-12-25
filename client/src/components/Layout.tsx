import type { JSX, RefObject, ReactNode, ComponentType } from 'react'
import { useState, useCallback, forwardRef, useRef } from 'react'
import type { LinkProps, To } from 'react-router'
import { Link, useLocation } from 'react-router'
import { useElementSize } from '@reactuses/core'

import Avatar from '@mui/material/Avatar'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { blue, green, pink, grey } from '@mui/material/colors'
import useMediaQuery from '@mui/material/useMediaQuery'

import MoneyIcon from '@mui/icons-material/AttachMoney'
import CartIcon from '@mui/icons-material/ShoppingCart'
import CartPlusIcon from '@mui/icons-material/AddShoppingCart'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import BoxesIcon from '@mui/icons-material/Dns'
import MovementsIcon from '@mui/icons-material/SwapHoriz'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AtmIcon from '@mui/icons-material/LocalAtm'

import ResponsiveContainer, { type ResponsiveContainerProps } from './ResponsiveContainer'
import useUser from '../hooks/useUser'
import { Theme } from '../theme'
import { GlobalErrorBoundary } from './GlobalErrorBoundary'

const drawerWidth = 96
const drawerWidthFull = 256

interface DrawerItemProps {
  icon: ReactNode
  to: To
  text: string
  fullWidth: boolean
  color: string
}

const DrawerItem = (props: DrawerItemProps) => {
  const {
    icon,
    to,
    text,
    fullWidth,
    color,
  } = props

  const colorStyle = { color: color, borderColor: color }

  const button =
    <DrawerIconButton style={colorStyle}>
      {icon}
    </DrawerIconButton>

  return (
    <DrawerItemLink to={to}>
      {fullWidth
        ? button
        : <Tooltip title={text} placement='right'>
          {button}
        </Tooltip>
      }
      {fullWidth && (
        <DrawerItemText style={colorStyle}>
          {text}
        </DrawerItemText>
      )}
    </DrawerItemLink>
  )
}
DrawerItem.displayName = 'DrawerItem'

// Need to forward the ref for the tooltip to work
const DrawerIconButtonImpl = forwardRef<HTMLButtonElement>((props, ref) =>
  <Button variant='outlined' ref={ref} {...props} />,
)
DrawerIconButtonImpl.displayName = 'DrawerIconButtonImpl'

const DrawerIconButton = styled(DrawerIconButtonImpl)(({ theme }: { theme: Theme }) => ({
  width: theme.spacing(10),
  minWidth: theme.spacing(10),
  height: theme.spacing(10),
  borderRadius: theme.spacing(5),
  marginRight: theme.spacing(2),
  '& svg': {
    fontSize: theme.spacing(6),
  },
})) as typeof Button

const DrawerItemLink = styled(Link)(({ theme }: { theme: Theme }) => ({
  marginBottom: theme.spacing(1),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  textDecoration: 'none',
}))

const DrawerItemText = styled(
  (props: TypographyProps) => <Typography variant='h6' {...props} />,
)({
  color: 'black',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  fontSize: '1.3rem',
}) as typeof Typography


interface MainDrawerProps {
  open: boolean
  onRequestClose: () => unknown
  appBarRef: RefObject<HTMLElement | null>
}

const MainDrawer = (props: MainDrawerProps) => {
  const { open, onRequestClose, appBarRef } = props

  const content =
    <>
      <DrawerItem
        text='Tablero'
        to='/dashboard'
        icon={<DashboardIcon />}
        color={blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Ventas'
        to='/sells'
        icon={<CartPlusIcon />}
        color={blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Pagos'
        to='/payments'
        icon={<MoneyIcon />}
        color={blue.A700}
        fullWidth={open}
      />

      <DrawerItem
        text='Salidas'
        to='/spendings'
        icon={<CartIcon />}
        color={blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Inventario'
        to='/inventory'
        icon={<BoxesIcon />}
        color={blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Movimientos'
        to='/movements'
        icon={<MovementsIcon />}
        color={blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Balance'
        to='/balance'
        icon={<TrendingUpIcon />}
        color={blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Clientes'
        to='/clients'
        icon={<PersonIcon />}
        color={blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Precios'
        to='/prices'
        icon={<AtmIcon />}
        color={blue.A700}
        fullWidth={open}
      />
    </>

  const mobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  if (mobile) {
    return (
      <StyledDrawer
        variant='temporary'
        open={open}
        onClose={onRequestClose}
      >
        {content}
      </StyledDrawer>
    )
  }

  return (
    <StyledDrawer variant='permanent' open={open}>
      <ToolbarDiv appBarRef={appBarRef} />
      {content}
    </StyledDrawer>
  )
}

const StyledDrawer = styled(Drawer)(({ theme, open }: { theme: Theme, open: boolean }) => {
  return {
    [theme.breakpoints.down('sm')]: {
      zIndex: theme.zIndex.drawer + 2,
    },
    '& .MuiDrawer-paper': {
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: theme.spacing(1),
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      ...(open ? { width: drawerWidthFull } : {}),
    },
  }
}) as typeof Drawer

export interface LayoutProps {
  children: ReactNode
  className?: string
  title: string
  container?: string | ComponentType<{ className?: string }>
  appBarExtra?: ReactNode
}

const WideResponsiveContainer = (props: ResponsiveContainerProps) =>
  <ResponsiveContainer variant='wide' {...props} />

const RouterLink = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <Link ref={ref} {...props} />
))
RouterLink.displayName = 'RouterLink'

export default function Layout(props: LayoutProps): JSX.Element {
  const {
    children,
    className,
    title,
    appBarExtra,
    container = WideResponsiveContainer,
  } = props
  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen(prev => !prev)
  }, [])
  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  // User session
  const { user } = useUser() ?? { user: null }

  const { pathname: currentPath } = useLocation()

  const appBarRef = useRef<HTMLElement | null>(null)

  const userColorLookup: { [index: string]: string } = {
    '001': blue[500],
    '002': pink[500],
    '003': green[500],
  }

  const getUserColor = (userCode: string) => (
    userColorLookup[userCode] || grey[500]
  )

  const Container = container
  const containerProps = className ? { className } : undefined
  return (<>
    <StyledAppBar position='fixed' ref={appBarRef}>
      <Toolbar>
        <MenuButton
          color='inherit'
          onClick={handleDrawerToggle}
          edge='start'
          size="large">
          <MenuIcon />
        </MenuButton>
        <Title>{title}</Title>
        {appBarExtra}
        {user
          ? <StyledAvatar
            aria-label={user.name}
            style={{ backgroundColor: getUserColor(user.code) }}
          >
            {user.name.charAt(0).toUpperCase()}
          </StyledAvatar>
          : <Button
            component={RouterLink}
            to={`/check?next=${currentPath}`}
            color='inherit'
          >
            Iniciar Sesion
          </Button>
        }
      </Toolbar>
    </StyledAppBar>
    <MainDrawer
      open={drawerOpen}
      onRequestClose={handleDrawerClose}
      appBarRef={appBarRef}
    />
    <ContentWrapper onClick={handleDrawerClose}>
      <ToolbarDiv appBarRef={appBarRef} />
      <Container {...containerProps}>
        <GlobalErrorBoundary>
          {children}
        </GlobalErrorBoundary>
      </Container>
    </ContentWrapper>
  </>)
}

const Title = styled(
  (props: TypographyProps) => <Typography variant='h6' sx={{ color: 'inherit' }} {...props} />,
)({
  flexGrow: 1,
  fontWeight: 500,
}) as typeof Typography

const StyledAppBar = styled(AppBar)(({ theme }: { theme: Theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
})) as typeof AppBar

const MenuButton = styled(IconButton)(({ theme }: { theme: Theme }) => ({
  marginRight: theme.spacing(2),
})) as typeof IconButton


const ToolbarDiv = ({ appBarRef }: { appBarRef: RefObject<HTMLElement | null> }) => {
  const [_, height] = useElementSize(appBarRef, { box: 'border-box' })

  return (
    <div style={{ height, minHeight: height }} />
  )
}

const ContentWrapper = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    paddingLeft: drawerWidth,
  },
})) as unknown as 'div'

const StyledAvatar = styled(Avatar)(({ theme }: { theme: Theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
})) as typeof Avatar
