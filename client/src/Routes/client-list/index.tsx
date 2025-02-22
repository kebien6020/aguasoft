import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import { red } from '@mui/material/colors'

import Alert from '../../components/Alert'
import Layout from '../../components/Layout'
import LoadingScreen from '../../components/LoadingScreen'
import ResponsiveContainer from '../../components/ResponsiveContainer'
import { fetchJsonAuth, isErrorResponse } from '../../utils'
import useAuth from '../../hooks/useAuth'
import { ClientWithNotes } from './types'
import { ClientItem } from './components/ClientItem'
import { AppBarExtra } from './components/AppBarExtra'
import { useClients } from '../../hooks/api/useClients'
import useSnackbar from '../../hooks/useSnackbar'
import { ClientDialog } from './components/ClientDialog'

const ClientList = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const showError = useSnackbar()

  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [clientDeleteDialogOpen, setClientDeleteDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientWithNotes | null>(null)
  const [errorDeleting, setErrorDeleting] = useState(false)
  const [deletedClient, setDeletedClient] = useState<string | null>(null)
  const [showHidden, setShowHidden] = useState(false)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)

  const [clients, { update, error: clientsError }] = useClients<ClientWithNotes>({
    params: { includeNotes: 'true' },
  })

  const handleClientClick = useCallback((client: ClientWithNotes) => {
    setSelectedClient(client)
    setClientDialogOpen(true)
  }, [])

  const handleClientDialogClose = useCallback(() => {
    setSelectedClient(null)
    setClientDialogOpen(false)
  }, [])

  const handleClientTryDelete = useCallback((client: ClientWithNotes) => {
    setSelectedClient(client)
    setClientDialogOpen(false)
    setClientDeleteDialogOpen(true)
  }, [])

  const handleClientDeleteDialogClose = useCallback(() => {
    setSelectedClient(null)
    setClientDeleteDialogOpen(false)
  }, [])

  const handleClientDelete = useCallback(async () => {
    if (!clients) return
    if (!selectedClient) return

    const res = await fetchJsonAuth(`/api/clients/${selectedClient.id}`, auth, {
      method: 'DELETE',
    })

    if (isErrorResponse(res)) {
      console.error(res)
      setErrorDeleting(true)
      setDeletedClient(null)
      setClientDeleteDialogOpen(false)
      return
    }

    // remove client from the list and show success message
    update()
    setErrorDeleting(false)
    setDeletedClient(selectedClient.name)

    setClientDeleteDialogOpen(false)
    window.scroll(0, 0)
  }, [auth, clients, selectedClient, update])

  const handleClientEdit = useCallback(() => {
    if (!selectedClient) return

    navigate(`/clients/${selectedClient.id}`)
  }, [navigate, selectedClient])

  const handleClientHide = useCallback(async () => {
    if (!clients) return
    if (!selectedClient) return

    const res = await fetchJsonAuth(`/api/clients/${selectedClient.id}/hide`, auth, {
      method: 'POST',
    })

    if (isErrorResponse(res)) {
      showError('Error ocultando cliente: ' + res.error.message)
      return
    }

    update()
    setClientDialogOpen(false)
  }, [auth, clients, selectedClient, showError, update])

  const handleClientUnhide = useCallback(async () => {
    if (!clients) return
    if (!selectedClient) return

    const res = await fetchJsonAuth(`/api/clients/${selectedClient.id}/unhide`, auth, {
      method: 'POST',
    })

    if (isErrorResponse(res)) {
      showError('Error desocultando cliente: ' + res.error.message)
      return
    }

    update()
    setClientDialogOpen(false)
  }, [auth, clients, selectedClient, showError, update])

  const toggleHidden = useCallback(() => {
    setShowHidden(prev => !prev)
  }, [])

  const handleClientShowNotes = useCallback(() => {
    if (!selectedClient) return

    setNotesDialogOpen(true)
    setClientDialogOpen(false)
  }, [selectedClient])

  const handleNotesDialogClose = useCallback(() => {
    setNotesDialogOpen(false)
  }, [])

  const handleClientShowBalance = useCallback(() => {
    if (!selectedClient) return

    navigate(`/clients/${selectedClient.id}/balance`)
  }, [navigate, selectedClient])

  if (clients === null)
    return <LoadingScreen text='Cargando clientes…' />

  const clientsFiltered = showHidden
    ? clients
    : clients.filter(cl => !cl.hidden)

  return (
    <Layout
      title='Lista de Clientes'
      container={ResponsiveContainer}
      appBarExtra={
        <AppBarExtra
          onToggleHidden={toggleHidden}
          showHidden={showHidden}
        />
      }
    >
      {clientDialogOpen && selectedClient
        && <ClientDialog
          open={true}
          onClose={handleClientDialogClose}
          client={selectedClient}
          onClientEdit={handleClientEdit}
          onClientHide={handleClientHide}
          onClientUnhide={handleClientUnhide}
          onClientDelete={handleClientTryDelete}
          onClientShowNotes={handleClientShowNotes}
          onClientShowBalance={handleClientShowBalance}
        />
      }
      {clientDeleteDialogOpen && selectedClient
        && <Dialog
          open={true}
          onClose={handleClientDeleteDialogClose}
        >
          <DialogTitle>Eliminar {selectedClient.name}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Desea eliminar permanentemente el
              cliente {selectedClient.name} y <strong>todas</strong> las
              ventas y precios asociados?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClientDeleteDialogClose} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleClientDelete} sx={{
              color: red[500],
              fontWeight: 'bold',
            }}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      }
      {notesDialogOpen && selectedClient
        && <Dialog
          open={true}
          onClose={handleNotesDialogClose}
        >
          <DialogTitle style={{ marginBottom: 0 }}>
            {selectedClient.name}: Informacion de Contacto
          </DialogTitle>
          <DialogContent>
            {selectedClient.notes
              && selectedClient.notes.split('\n').map((note, idx) =>
                <DialogContentText key={idx}>
                  {note}
                </DialogContentText>,
              )
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={handleNotesDialogClose} autoFocus color='primary'>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      }
      {clientsError
        && <Alert type='error' message='Error cargando lista de clientes' />
      }
      {errorDeleting
        && <Alert type='error' message='Error eliminado cliente' />
      }
      {deletedClient
        && <Alert
          type='success'
          message={`Cliente ${deletedClient} eliminado exitosamente.`}
        />
      }
      <List>
        {clientsFiltered.map(cl =>
          <ClientItem
            key={cl.id}
            client={cl}
            onClick={() => handleClientClick(cl)}
          />,
        )}
      </List>
    </Layout>
  )
}

export default ClientList
