export interface Product {
  id: number
  name: string
  code: string
  basePrice: string
}

export interface Price {
  value: string
  clientId: number
  productId: number
  name: string
}

export interface User {
  id: number
  name: string
  code: string
  role: string
}

export interface Client {
  id: number
  name: string
  code: string
  defaultCash: boolean
  hidden: boolean
}
