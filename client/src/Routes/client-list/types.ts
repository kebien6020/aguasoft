import { Client } from '../../models'

export interface ClientWithNotes extends Client {
  notes: string
}
