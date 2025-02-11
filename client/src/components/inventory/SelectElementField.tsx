import { useState, useEffect } from 'react'
import { useFormikContext, useField } from 'formik'

import useStorageStates from '../../hooks/api/useStorageStates'
import SelectField, { SelectFieldProps } from '../form/SelectField'
import useStorages from '../../hooks/api/useStorages'

export interface SelectElementFieldProps extends SelectFieldProps {
  statesNonce?: number
  storageCode: string
}

const SelectElementField = (props: SelectElementFieldProps): JSX.Element => {
  const { statesNonce = 1, storageCode, ...otherProps } = props
  const { setFieldValue } = useFormikContext()

  const [field] = useField(props.name)

  const [helperText, setHelperText] = useState<string | undefined>(undefined)
  const [storageStates, updateStates] = useStorageStates({ include: ['Storage', 'InventoryElement'] })
  const [storages] = useStorages()

  useEffect(() => {
    if (statesNonce > 1)
      updateStates()

  }, [statesNonce, updateStates])

  useEffect(() => {
    if (field.value !== '' && storageStates) {
      const elementState = storageStates.find(state =>
        state.Storage && state.Storage.code === storageCode
        && state.InventoryElement && state.InventoryElement.code === field.value
      )
      if (!elementState) {
        const storage = storages && storages.find(s => s.code === storageCode)
        const storageName = storage ? storage.name : storageCode
        setHelperText(`No hay registros de este elemento en ${storageName}`)
        return
      }

      const qty = elementState.quantity
      setHelperText(`Cantidad de este elemento en ${elementState.Storage?.name ?? 'Bodega Desconocida'}: ${qty}`)
    }
  }, [field.value, storageCode, storageStates, storages])

  const onChangeOverride = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
    const value = event.target.value
    setFieldValue(props.name, value)
  }

  return (
    <SelectField
      onChangeOverride={onChangeOverride}
      helperText={helperText}
      {...otherProps}
    />
  )
}

export default SelectElementField
