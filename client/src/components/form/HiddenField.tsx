import { useField } from 'formik'
import { useEffect } from 'react'

export const HiddenField = ({ name, value }: { name: string, value: string }) => {
  const [field] = useField(name)
  const { onChange } = field

  useEffect(() => {
    onChange({ target: { name, value } })

    return () => {
      // Restore value on unmount
      onChange({ target: { name, value: '' } })
    }

  }, [value, name, onChange])

  return null
}
