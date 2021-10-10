import { MakeRequired } from '../../../../utils/types'

export interface User {
  id: number
  code:string
  name: string
}

export interface SimplePrice {
  id: number
  value: number
  name: string
}

export interface ProductVariant {
  readonly id: number
  readonly productId: number
  readonly code: string
  readonly name: string
  readonly basePrice: string | null
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null

  // Possible inclussions
  readonly Product?: Product
}

export interface Product {
  id: number
  code: string
  name: string
  basePrice: string

  Variants?: ProductVariant[]
}

export type SaleProduct = MakeRequired<Product, 'Variants'>

export interface Price {
  id: number
  clientId: number
  productId: number
  value: number
  name: string
}
