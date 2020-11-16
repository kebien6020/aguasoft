import React, { useEffect, useState } from 'react'
import DateControl from '../../components/controls/DateControl'
import SelectControl from '../../components/controls/SelectControl'
import Layout from '../../components/Layout'
import Title from '../../components/Title'
import { useClientOptions } from '../../hooks/api/useClients'
import { useQueryParam } from '../../hooks/useQueryParam'
import moment from 'moment'
import { Button, Grid, Link, styled, TextField } from '@material-ui/core'
import { BillingSummaryPdf, BillingSummaryPdfProps } from './components/BillingSummaryPdf'
import { pdf, PDFViewer } from '@react-pdf/renderer'
import { useSales } from '../../hooks/api/useSales'
import { Sell } from '../../models'
import { MakeRequired } from '../../utils/types'
import { useDebounce } from '@react-hook/debounce'
import { Alert } from '@material-ui/lab'
import { endOfMonth, isSameDay, isSameMonth, format, startOfMonth, setDate, parseISO } from 'date-fns'
import es from 'date-fns/locale/es'
import { firstUpper } from '../../utils/helper'

const startOfPrevMonth = moment().subtract(1, 'month').startOf('month')
const endOfPrevMonth = startOfPrevMonth.clone().endOf('month')

export type SaleWithProduct = MakeRequired<Sell, 'Product'>

const BillingSummary = (): JSX.Element => {
  const [clientId = '', setClientId] = useQueryParam('clientId')
  const [clientOptions] = useClientOptions()

  const [beginDateIso, setBeginDateIso] = useQueryParam('beginDate', startOfPrevMonth.toISOString())
  const beginDate = moment(beginDateIso)

  const [endDateIso, setEndDateIso] = useQueryParam('endDate', endOfPrevMonth.toISOString())
  const endDate = moment(endDateIso)

  const [sales, { loading: loadingSales }] = useSales<SaleWithProduct>({
    minDate: beginDateIso,
    maxDate: endDateIso,
    clientId: clientId !== '' ? clientId : undefined,
    include: ['Product'],
  })
  const clientName = clientOptions?.find(c => c.value === clientId)?.label
  const title = clientName ? `Facturación ${clientName}` : undefined

  const [pdfProps, setPdfProps] = useDebounce<BillingSummaryPdfProps|null>(null, 1000, true)
  useEffect(() => {
    (async() => {
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
    const isFullMonth =
      isSameMonth(begin, end)
      && isSameDay(begin, startOfMonth(begin))
      && isSameDay(end, endOfMonth(begin))

    const month = firstUpper(format(begin, 'MMMM', { locale: es }))
    if (isFullMonth) {
      setDownloadName(`${clientName} ${month}`)
      return
    }

    const isFirstHalf =
      isSameMonth(begin, end)
      && isSameDay(begin, startOfMonth(end))
      && isSameDay(end, setDate(begin, 15))

    if (isFirstHalf) {
      setDownloadName(`${clientName} ${month} - Quincena 1`)
      return
    }

    const isSecondHalf =
      isSameMonth(begin, end)
      && isSameDay(begin, setDate(begin, 16))
      && isSameDay(end, endOfMonth(begin))

    if (isSecondHalf) {
      setDownloadName(`${clientName} ${month} - Quincena 2`)
      return
    }

    setDownloadName(clientName)
  }, [beginDateIso, clientName, endDateIso])

  return (
    <Layout title='Facturación'>
      <Title>Configuración</Title>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SelectControl
            name='client'
            label='Cliente'
            options={clientOptions}
            value={clientOptions ? clientId : ''}
            onChange={e => setClientId(e.target.value as string)}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <DateControl
            label='Fecha de Inicio'
            date={beginDate}
            onDateChange={date => setBeginDateIso(date.toISOString())}
            DatePickerProps={{ fullWidth: true }}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <DateControl
            label='Fecha Final'
            date={endDate}
            onDateChange={date => setEndDateIso(date.toISOString())}
            DatePickerProps={{ fullWidth: true }}
          />
        </Grid>
        <Grid item xs={12}>
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

interface ErrorBoundaryProps {
  children?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class PDFErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: unknown) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  reloadPage(event: React.SyntheticEvent) {
    event.preventDefault()
    // eslint-disable-next-line no-self-assign
    location.href = location.href
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <Alert severity='error'>
          Sucedió un error al mostrar el PDF. Intenta{' '}
          <Link href='#' onClick={this.reloadPage}>recargar la página</Link>.
        </Alert>
      )
    }

    return this.props.children
  }
}
