import type { JSX } from 'react'
import { Button, Grid2 as Grid, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useDebounce } from '@react-hook/debounce'
import { pdf, PDFViewer } from '@react-pdf/renderer'
import { addMonths, endOfMonth, format, isSameDay, isSameMonth, parseISO, setDate, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { useEffect, useState } from 'react'
import DateControl from '../../components/controls/DateControl'
import SelectControl from '../../components/controls/SelectControl'
import Layout from '../../components/Layout'
import Title from '../../components/Title'
import { useClientOptions } from '../../hooks/api/useClients'
import { useSales } from '../../hooks/api/useSales'
import { useQueryParam } from '../../hooks/useQueryParam'
import { Sell } from '../../models'
import { firstUpper } from '../../utils/helper'
import { MakeRequired } from '../../utils/types'
import { BillingSummaryPdf, BillingSummaryPdfProps } from './components/BillingSummaryPdf'
import { PDFErrorBoundary } from './components/PDFErrorBoundary'

const startOfPrevMonth = startOfMonth(addMonths(new Date, -1))
const endOfPrevMonth = endOfMonth(addMonths(new Date, -1))

const detectDownloadName = (clientName: string, begin: Date, end: Date) => {
  const isFullMonth =
    isSameMonth(begin, end)
    && isSameDay(begin, startOfMonth(begin))
    && isSameDay(end, endOfMonth(begin))

  const month = firstUpper(format(begin, 'MMMM', { locale: es }))
  if (isFullMonth)
    return `${clientName} ${month}`


  const isFirstHalf =
    isSameMonth(begin, end)
    && isSameDay(begin, startOfMonth(end))
    && isSameDay(end, setDate(begin, 15))

  if (isFirstHalf)
    return `${clientName} ${month} - Quincena 1`


  const isSecondHalf =
    isSameMonth(begin, end)
    && isSameDay(begin, setDate(begin, 16))
    && isSameDay(end, endOfMonth(begin))

  if (isSecondHalf)
    return `${clientName} ${month} - Quincena 2`


  return clientName
}

export type SaleWithProduct = MakeRequired<Sell, 'Product'>

const BillingSummary = (): JSX.Element => {
  const [clientId = '', setClientId] = useQueryParam('clientId')
  const [clientOptions] = useClientOptions()

  const [beginDateIso, setBeginDateIso] = useQueryParam('beginDate', startOfPrevMonth.toISOString())
  const beginDate = new Date(beginDateIso ?? NaN)

  const [endDateIso, setEndDateIso] = useQueryParam('endDate', endOfPrevMonth.toISOString())
  const endDate = new Date(endDateIso ?? NaN)

  const [sales, { loading: loadingSales }] = useSales<SaleWithProduct>({
    minDate: beginDateIso,
    maxDate: endDateIso,
    clientId: clientId !== '' ? clientId : undefined,
    include: ['Product'],
  })
  const clientName = clientOptions?.find(c => c.value === clientId)?.label
  const title = clientName ? `Facturación ${clientName}` : undefined

  const [pdfProps, setPdfProps] = useDebounce<BillingSummaryPdfProps | null>(null, 1000, true)
  useEffect(() => {
    (async () => {
      if (title && sales && !loadingSales) {
        setPdfProps(null) // manually cause an unmount
        await new Promise(resolve => setTimeout(resolve, 1100))
        setPdfProps({ title, sales })
      }
    })()
  }, [sales, loadingSales]) // eslint-disable-line react-hooks/exhaustive-deps

  const [downloadName, setDownloadName] = useState('')

  // Detect download name
  useEffect(() => {
    if (!clientName || !beginDateIso || !endDateIso) return
    const begin = parseISO(beginDateIso)
    const end = parseISO(endDateIso)

    setDownloadName(detectDownloadName(clientName, begin, end))
  }, [beginDateIso, clientName, endDateIso])

  return (
    <Layout title='Facturación'>
      <Title>Configuración</Title>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <SelectControl
            name='client'
            label='Cliente'
            options={clientOptions}
            value={clientOptions ? clientId : ''}
            onChange={e => setClientId(e.target.value as string)}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <DateControl
            label='Fecha de Inicio'
            date={beginDate}
            onDateChange={date => setBeginDateIso(date.toISOString())}
            DatePickerProps={{
              slotProps: {
                textField: {
                  fullWidth: true,
                },
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <DateControl
            label='Fecha Final'
            date={endDate}
            onDateChange={date => setEndDateIso(date.toISOString())}
            DatePickerProps={{
              slotProps: {
                textField: {
                  fullWidth: true,
                },
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label='Nombre de la descarga (editable)'
            value={downloadName}
            onChange={e => setDownloadName(e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      <Title>Documento Generado</Title>
      <PDFErrorBoundary>
        <Center>
          {pdfProps && (() => {
            const doc = <BillingSummaryPdf {...pdfProps} />
            return <>
              <PDFDownloadLink doc={doc} name={downloadName} />
              <PDFPreview doc={doc} />
            </>
          })()}
        </Center>
      </PDFErrorBoundary>
    </Layout>
  )
}

export default BillingSummary

interface DocProp {
  doc: JSX.Element
}

const PDFPreview = ({ doc }: DocProp) => {
  return (
    <PDFViewer width='100%' height='800' style={{ marginTop: 12 }}>
      {doc}
    </PDFViewer>
  )
}

const downloadFile = (blob: Blob, name: string) => {
  const link = document.createElement('a')
  link.setAttribute('download', name)
  link.href = URL.createObjectURL(blob)
  link.click()
}

interface PDFDownloadLinkProps extends DocProp {
  name: string
}

const PDFDownloadLink = ({ doc, name }: PDFDownloadLinkProps) => {

  const handleDownload = async () => {
    const blob = await pdf(doc).toBlob()
    downloadFile(blob, `Facturacion ${name}.pdf`)
  }

  const noName = name === ''

  return (
    <Button
      href={'#'}
      variant='outlined'
      color='primary'
      onClick={e => {
        e.preventDefault()
        void handleDownload()
      }}
      disabled={noName}
    >
      {noName ? 'Selecciona un nombre de la descarga' : 'Descargar'}
    </Button>

  )
}

const Center = styled('div')({
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
})

