import type { JSX } from 'react'
import React, { useState, useCallback, type ReactNode, forwardRef, type ComponentType } from 'react'
import { Link, type LinkProps, useLocation } from 'react-router'
import { type LocationDescriptor } from 'history'

import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography, { TypographyProps } from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import * as colors from '@mui/material/colors'

import {
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  AddShoppingCart as CartPlusIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Dns as BoxesIcon,
  SwapHoriz as MovementsIcon,
  TrendingUp,
  Dashboard as DashboardIcon,
} from '@mui/icons-material'

import ResponsiveContainer, { ResponsiveContainerProps } from './ResponsiveContainer'
import useUser from '../hooks/useUser'
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'
import { Theme } from '../theme'
import { useMediaQuery } from '@mui/material'
import { GlobalErrorBoundary } from './GlobalErrorBoundary'

const drawerWidth = 96
const drawerWidthFull = 256

interface DrawerItemProps {
  icon: ReactNode,
  to: LocationDescriptor<unknown>
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
    color = colors.grey[500],
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
}

const MainDrawer = (props: MainDrawerProps) => {
  const { open, onRequestClose } = props

  const content =
    <>
      <DrawerItem
        text='Tablero'
        to='/dashboard'
        icon={<DashboardIcon />}
        color={colors.blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Ventas'
        to='/sells'
        icon={<CartPlusIcon />}
        color={colors.blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Pagos'
        to='/payments'
        icon={<MoneyIcon />}
        color={colors.blue.A700}
        fullWidth={open}
      />

      <DrawerItem
        text='Salidas'
        to='/spendings'
        icon={<CartIcon />}
        color={colors.blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Inventario'
        to='/inventory'
        icon={<BoxesIcon />}
        color={colors.blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Movimientos'
        to='/movements'
        icon={<MovementsIcon />}
        color={colors.blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Balance'
        to='/balance'
        icon={<TrendingUp />}
        color={colors.blue.A700}
        fullWidth={open}
      />
      <DrawerItem
        text='Clientes'
        to='/clients'
        icon={<PersonIcon />}
        color={colors.blue.A700}
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
      <ToolbarDiv />
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

  const userColorLookup: { [index: string]: string } = {
    '001': colors.blue[500],
    '002': colors.pink[500],
    '003': colors.green[500],
  }

  const getUserColor = (userCode: string) => (
    userColorLookup[userCode] || colors.grey[500]
  )

  const Container = container
  const containerProps = className ? { className } : undefined
  return (<>
    <StyledAppBar position='fixed'>
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
    />
    <ContentWrapper onClick={handleDrawerClose}>
      <ToolbarDiv />
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

const ToolbarDiv = styled('div')(({ theme }) =>
  theme.mixins.toolbar,
) as unknown as 'div'

const ContentWrapper = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    paddingLeft: drawerWidth,
  },
})) as unknown as 'div'

const StyledAvatar = styled(Avatar)(({ theme }: { theme: Theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
})) as typeof Avatar
