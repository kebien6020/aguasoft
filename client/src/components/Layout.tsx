import * as React from 'react'
import { useState, useCallback } from 'react'
import { Link, LinkProps, useLocation } from 'react-router-dom'
import { LocationDescriptor } from 'history'
import clsx from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles'

import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import ToolBar from '@material-ui/core/ToolBar'
import Tooltip from '@material-ui/core/Tooltip'
import * as colors from '@material-ui/core/colors'

import {
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  AddShoppingCart as CartPlusIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Dns as BoxesIcon,
} from '@material-ui/icons'

import ResponsiveContainer, { ResponsiveContainerProps } from './ResponsiveContainer'
import useUser from '../hooks/useUser'
import Avatar from '@material-ui/core/Avatar'

const drawerWidth = 96
const drawerWidthFull = 256

interface DrawerItemProps {
  icon: React.ReactNode,
  to: LocationDescriptor<{}>
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
  const classes = useDrawerItemClasses()

  const colorStyle = {color: color, borderColor: color};

  const button =
    <Button variant='outlined' className={classes.icon} style={colorStyle}>
      {icon}
    </Button>

  return (
    <Link className={classes.container} to={to}>
      {fullWidth ?
        button :
        <Tooltip  title={text} placement='right'>
          {button}
        </Tooltip>
      }
      {fullWidth &&
        <Typography
          variant='h6'
          className={classes.text}
          style={colorStyle}
        >
          {text}
        </Typography>
      }
    </Link>
  )
}

const useDrawerItemClasses = makeStyles(theme => ({
  container: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
  },
  icon: {
    width: theme.spacing(10),
    minWidth: theme.spacing(10),
    height: theme.spacing(10),
    borderRadius: theme.spacing(5),
    marginRight: theme.spacing(2),
    '& svg': {
      fontSize: theme.spacing(6),
    }
  },
  text: {
    color: 'black',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    fontSize: '1.3rem',
  },
}))

interface MainDrawerProps {
  open: boolean
  onRequestClose: () => any
}

const MainDrawer = React.forwardRef((props: MainDrawerProps, ref) => {
  const { open, onRequestClose } = props
  const classes = useDrawerStyles()

  const content =
    <>
      <DrawerItem
        text='Ventas'
        to='/sells'
        icon={<CartPlusIcon />}
        color={colors.green[500]}
        fullWidth={open}
      />
      <DrawerItem
        text='Pagos'
        to='/payments'
        icon={<MoneyIcon />}
        color={colors.blue['A700']}
        fullWidth={open}
      />

      <DrawerItem
        text='Salidas'
        to='/spendings'
        icon={<CartIcon />}
        color={colors.green[500]}
        fullWidth={open}
      />
      <DrawerItem
        text='Inventario'
        to='/inventory'
        icon={<BoxesIcon />}
        color={colors.blue['A700']}
        fullWidth={open}
      />
      <DrawerItem
        text='Clientes'
        to='/clients'
        icon={<PersonIcon />}
        color={colors.orange[500]}
        fullWidth={open}
      />
    </>

  const drawerClasses = {
    paper: clsx(classes.drawerPaper, open && classes.drawerOpen)
  }

  return (
    <>
      <Hidden smUp implementation='js'> {/* mobile */}
        <Drawer
          classes={drawerClasses}
          variant='temporary'
          open={open}
          onClose={onRequestClose}
          ref={ref}
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation='js'> {/* desktop */}
        <Drawer
          classes={drawerClasses}
          variant='permanent'
          ref={ref}
        >
          <div className={classes.toolbar} />
          {content}
        </Drawer>
      </Hidden>
    </>
  )
});

const useDrawerStyles = makeStyles((theme: Theme) => ({
  drawerPaper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerOpen: {
    width: drawerWidthFull,
  },
  toolbar: theme.mixins.toolbar
}))

interface Props {
  children: React.ReactNode
  className?: string
  title: string
  container?: string | React.ComponentType<{className?: string}>
  appBarExtra?: React.ReactNode
}

const WideResponsiveContainer = (props: ResponsiveContainerProps) =>
  <ResponsiveContainer variant='wide' {...props} />

const RouterLink = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <Link innerRef={ref} {...props} />
));

export default function Layout(props : Props) {
  const {
    children,
    className,
    title,
    appBarExtra,
    container = WideResponsiveContainer,
  } = props
  const classes = useStyles()
  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen(!drawerOpen)
  }, [drawerOpen])
  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  // User session
  const { user } = useUser()

  const { pathname: currentPath } = useLocation()

  const userColorLookup : {[index:string] : string} = {
    '001': colors.blue[500],
    '002': colors.pink[500],
    '003': colors.green[500],
  }

  const getUserColor = (userCode: string) => (
    userColorLookup[userCode] || colors.grey[500]
  )

  const Container = container
  const containerProps = className ? {className} : undefined
  return (
    <>
      <AppBar position='fixed' className={classes.appBar}>
        <ToolBar>
          <IconButton
            color='inherit'
            onClick={handleDrawerToggle}
            edge='start'
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' color='inherit' className={classes.title}>
            {title}
          </Typography>
          {appBarExtra}
          {user ?
            <Avatar
              aria-label={user.name}
              className={classes.avatar}
              style={{backgroundColor: getUserColor(user.code)}}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar> :
            <Button
              component={RouterLink}
              to={`/check?next=${currentPath}`}
              color='inherit'
            >
              Iniciar Sesion
            </Button>
          }
        </ToolBar>
      </AppBar>
      <MainDrawer
        open={drawerOpen}
        onRequestClose={handleDrawerClose}
      />
      <div className={classes.content} onClick={handleDrawerClose}>
        <div className={classes.toolbar} />
        <Container {...containerProps}>
          {children}
        </Container>
      </div>
    </>
  )
}

const useStyles = makeStyles(theme => ({
  title: {
    flexGrow: 1,
    '& h6': {
      fontSize: '48px',
      fontWeight: 400,
    },
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbar: theme.mixins.toolbar,
  content: {
    [theme.breakpoints.up('sm')]: {
      paddingLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}))
