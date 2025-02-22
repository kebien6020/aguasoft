import * as React from 'react'
import { Theme } from '@mui/material'
import Button, { ButtonProps } from '@mui/material/Button'
import { makeStyles } from '@mui/styles'
import clsx from 'clsx'
import { getOffset } from './core'
import { RenderButtonProps } from './Pagination'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minWidth: 16,
  },
  rootCurrent: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
  rootEllipsis: {
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
  rootEnd: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
  rootStandard: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
  sizeSmall: {
    minWidth: 8,
  },
  sizeSmallCurrent: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  sizeSmallEllipsis: {
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
  },
  sizeSmallEnd: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  sizeSmallStandard: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  sizeLarge: {
    minWidth: 24,
  },
  sizeLargeCurrent: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  sizeLargeEllipsis: {
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75),
  },
  sizeLargeEnd: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  sizeLargeStandard: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}))

export type PageVariant = 'current' | 'ellipsis' | 'end' | 'standard';

export interface PageButtonProps extends Omit<ButtonProps, 'onClick'> {
  limit: number;
  page: number;
  total: number;
  pageVariant: PageVariant;
  currentPageColor?: ButtonProps['color'];
  onClick?: (ev: React.MouseEvent<HTMLElement>, offset: number, page: number) => void;
  renderButton?: (props: RenderButtonProps) => React.ReactElement;
  otherPageColor?: ButtonProps['color'];
}

const handleClick =
  (
    page: number,
    limit: number,
    onClick: (ev: React.MouseEvent<HTMLElement>, offset: number, page: number) => void,
  ) =>
    (ev: React.MouseEvent<HTMLElement>): void => {
      onClick(ev, getOffset(page, limit), page)
    }

const PageButton: React.FunctionComponent<PageButtonProps> = ({
  limit = 1,
  page = 0,
  total = 0,
  pageVariant = 'standard',
  currentPageColor,
  disabled: disabledProp = false,
  disableRipple: disableRippleProp = false,
  onClick: onClickProp,
  renderButton,
  otherPageColor,
  size,
  ...other
}) => {
  const isCurrent = pageVariant === 'current'
  const isEllipsis = pageVariant === 'ellipsis'
  const isEnd = pageVariant === 'end'
  const isStandard = pageVariant === 'standard'

  const isSmall = size === 'small'
  const isLarge = size === 'large'

  const {
    rootCurrent,
    rootEllipsis,
    rootEnd,
    rootStandard,
    sizeSmallCurrent,
    sizeSmallEllipsis,
    sizeSmallEnd,
    sizeSmallStandard,
    sizeLargeCurrent,
    sizeLargeEllipsis,
    sizeLargeEnd,
    sizeLargeStandard,
    ...classesBase
  } = useStyles()
  const classes = { ...classesBase }
  classes.root = clsx(classes.root, {
    [rootCurrent]: isCurrent,
    [rootEllipsis]: isEllipsis,
    [rootEnd]: isEnd,
    [rootStandard]: isStandard,
  })
  classes.sizeSmall = clsx(classes.sizeSmall, {
    [sizeSmallCurrent]: isCurrent && isSmall,
    [sizeSmallEllipsis]: isEllipsis && isSmall,
    [sizeSmallEnd]: isEnd && isSmall,
    [sizeSmallStandard]: isStandard && isSmall,
  })
  classes.sizeLarge = clsx(classes.sizeLarge, {
    [sizeLargeCurrent]: isCurrent && isLarge,
    [sizeLargeEllipsis]: isEllipsis && isLarge,
    [sizeLargeEnd]: isEnd && isLarge,
    [sizeLargeStandard]: isStandard && isLarge,
  })
  const color = isCurrent ? currentPageColor : otherPageColor
  const disabled = disabledProp || isEllipsis || page <= 0 || total <= 0
  const disableRipple = disableRippleProp || disabled || isCurrent
  const isClickable = !disabled && (isEnd || isStandard)
  let onClick: ((ev: React.MouseEvent<HTMLElement>) => void) | undefined
  if (isClickable && onClickProp)
    onClick = handleClick(page, limit, onClickProp)

  const button = (
    <Button
      classes={classes}
      color={color}
      disabled={disabled}
      disableRipple={disableRipple}
      onClick={onClick}
      size={size}
      {...other}
    />
  )

  if (renderButton && isClickable)
    return renderButton({ offset: getOffset(page, limit), page, children: button })


  return button
}

export default PageButton
