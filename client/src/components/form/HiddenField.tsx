import { useField } from 'formik'
import { useEffect } from 'react'

export const HiddenField = ({ name, value }: { name: string, value: string }) => {
  const [field] = useField(name)

  useEffect(() => {
    field.onChange({ target: { name, value } })

    return () => {
      // Restore value on unmount
      field.onChange({ target: { name, value: '' } })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, name])

  return null
}
