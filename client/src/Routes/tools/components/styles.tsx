import { useMemo } from 'react'
import type { ComponentType } from 'react'
import type { Style, SVGPresentationAttributes } from '@react-pdf/types'

type StyleProps = { style?: Style | Style[] | SVGPresentationAttributes }
type StyleParam<P> = Style | ((props: P) => Style)
type CT<P> = ComponentType<P>

export const styled = <P extends StyleProps>(Component: CT<P>) => (style: StyleParam<P>): CT<P> => {

  const StyledComponent = (props: P) => {
    const { style: propStyle } = props

    const resolvedStyles = useMemo(() => {
      const resolved = typeof style === 'function' ? style(props) : style
      const propStyleFlattened = (() => {
        if (!Array.isArray(propStyle))
          return propStyle

        return propStyle.reduce((acc, s) => ({ ...acc, ...s }), {})
      })()
      return { ...propStyleFlattened, ...resolved } as Style
    }, [props, propStyle])

    return (
      <Component {...props} style={resolvedStyles} />
    )
  }

  const displayName = Component.displayName ?? Component.name
  StyledComponent.displayName = `styled(${displayName})`

  return StyledComponent
}
