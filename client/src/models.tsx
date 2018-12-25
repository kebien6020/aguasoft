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
