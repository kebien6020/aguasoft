import { useMemo } from 'react'
import type { ComponentType, FunctionComponent } from 'react'
import type { Style, StyleProp, SVGPresentationAttributes } from '@react-pdf/types'

type StyleProps = { style?: StyleProp | SVGPresentationAttributes }
type StyleParam<P> = Style | ((props: P) => Style)
type CT<P> = ComponentType<P>

export const styled = <P extends StyleProps>(Component: CT<P>) => (style: StyleParam<P>): FunctionComponent<P> => {

  const StyledComponent = (props: P) => {
    const { style: propStyle } = props

    const resolvedStyles = useMemo(() => {
      const resolved = typeof style === 'function' ? style(props) : style
      const propStyleFlattened = (() => {
        if (!Array.isArray(propStyle))
          return propStyle as Style

        // Type shenanigans because arr.flat tries to be too smart and runs
        // into recursion limits
        const flattened = propStyle.flat(64 as 1) as Style[]

        return flattened.reduce((acc, s) => ({ ...acc, ...s }), {})
      })()
      return { ...propStyleFlattened, ...resolved }
    }, [props, propStyle])

    return (
      <Component {...props} style={resolvedStyles} />
    )
  }

  const displayName = Component.displayName ?? Component.name
  StyledComponent.displayName = `styled(${displayName})`

  return StyledComponent
}
