import { SimplePrice } from './models'
import { List as ImList } from 'immutable'

export type InputEvent = React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>

export type SaleLineKey = ImList<number|undefined> // actual wanted type: [number, number|undefined]

export interface SaleLineState {
  productQty: number
  selectedPrice: SimplePrice
}
