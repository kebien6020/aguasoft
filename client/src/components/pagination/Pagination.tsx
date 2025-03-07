import * as React from 'react'
import { ButtonProps } from '@mui/material'
import PageButton, { PageVariant } from './PageButton'
import { computePages, PagePosition, Position } from './core'

export interface RenderButtonProps {
  offset: number;
  page: number;
  children: React.ReactNode;
}

export interface PaginationProps {
  limit: number;
  offset: number;
  total: number;
  centerRipple?: boolean;
  component?: string | React.ComponentType<Partial<PaginationProps>>;
  currentPageColor?: ButtonProps['color'];
  disabled?: boolean;
  disableFocusRipple?: boolean;
  disableRipple?: boolean;
  fullWidth?: boolean;
  innerButtonCount?: number;
  nextPageLabel?: React.ReactNode;
  onClick?: (ev: React.MouseEvent<HTMLElement>, offset: number, page: number) => void;
  renderButton?: (props: RenderButtonProps) => React.ReactElement;
  otherPageColor?: ButtonProps['color'];
  outerButtonCount?: number;
  previousPageLabel?: React.ReactNode;
  reduced?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  children?: React.ReactNode;
}

const Pagination: React.FunctionComponent<PaginationProps> = ({
  limit = 1,
  offset = 0,
  total = 0,
  centerRipple = false,
  className,
  component = 'div',
  currentPageColor = 'secondary',
  disabled = false,
  disableFocusRipple = false,
  disableRipple = false,
  fullWidth = false,
  innerButtonCount: innerButtonCountProp = 2,
  nextPageLabel = '>',
  onClick,
  otherPageColor = 'primary',
  outerButtonCount: outerButtonCountProp = 2,
  previousPageLabel = '<',
  reduced = false,
  renderButton,
  size = 'medium',
  ...other
}) => {
  const innerButtonCount = reduced ? 1 : innerButtonCountProp
  const outerButtonCount = reduced ? 1 : outerButtonCountProp

  const Component = component
  return (
    <Component className={className} {...other}>
      {computePages(limit, offset, total, innerButtonCount, outerButtonCount).map(
        (pp: PagePosition) => {
          let key: React.Attributes['key']
          let children: React.ReactNode
          let pageVariant: PageVariant
          switch (pp.position) {
          case Position.Current:
            key = pp.position
            children = pp.page
            pageVariant = 'current'
            break
          case Position.LowEllipsis:
          case Position.HighEllipsis:
            key = -pp.position
            children = '...'
            pageVariant = 'ellipsis'
            break
          case Position.LowEnd:
          case Position.HighEnd:
            key = -pp.position
            children = pp.position === Position.LowEnd ? previousPageLabel : nextPageLabel
            pageVariant = 'end'
            break
          default:
            key = pp.page
            children = pp.page
            pageVariant = 'standard'
            break
          }

          return (
            <PageButton
              limit={limit}
              page={pp.page}
              total={total}
              centerRipple={centerRipple}
              currentPageColor={currentPageColor}
              disabled={disabled}
              disableFocusRipple={disableFocusRipple}
              disableRipple={disableRipple}
              fullWidth={fullWidth}
              key={key}
              onClick={onClick}
              renderButton={renderButton}
              otherPageColor={otherPageColor}
              pageVariant={pageVariant}
              size={size}
            >
              {children}
            </PageButton>
          )
        },
      )}
    </Component>
  )
}

export default Pagination
