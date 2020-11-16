import React, { ComponentType } from 'react'
import ReactPDF, { StyleSheet } from '@react-pdf/renderer'

type StyleResolvable = ReactPDF.Style | ReactPDF.Style[] | undefined

export const compose = (a: StyleResolvable, b: StyleResolvable): ReactPDF.Style[] => {
  let res = [] as ReactPDF.Style[]
  if (Array.isArray(a)) res = [...res, ...a]
  else if (a) res.push(a)

  if (Array.isArray(b)) res = [...res, ...b]
  else if (b) res.push(b)

  return res
}

type StyleProp = { style?: StyleResolvable }
type StyleParam<P> = StyleResolvable | ((props: P) => StyleResolvable)
type CT<P> = ComponentType<P>

export const styled = <P extends StyleProp>(Component: CT<P>) => (style: StyleParam<P>): CT<P> => {

  const sheet = typeof style !== 'function' ? StyleSheet.create({
    root: StyleSheet.flatten(style),
  }) : null

  const StyledComponent = (props: P) => {
    const { style: styleProp } = props
    const resolvedStyles = (() => {
      if (typeof style === 'function') return style(props)
      else if (sheet) return sheet.root
      return {}
    })()

    return (
      <Component {...props} style={compose(resolvedStyles, styleProp)} />
    )
  }


  const displayName = Component.displayName ?? Component.name ?? 'Anonymous'
  StyledComponent.displayName = `styled(${displayName})`

  return StyledComponent
}
