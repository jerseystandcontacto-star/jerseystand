// ============================================
// JERSEY STAND - Tipos globales de TypeScript
// ============================================

export type ProductCategory =
  | 'liga-mx'
  | 'seleccion-mexicana'
  | 'europa'
  | 'retro-vintage'
  | 'gear'

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

export type ProductType = 'local' | 'visitante' | 'tercero' | 'portero'

export type OrderStatus =
  | 'pendiente'
  | 'pagado'
  | 'preparando'
  | 'enviado'
  | 'entregado'
  | 'cancelado'
  | 'prueba'

export type ShippingType = 'estandar' | 'express' | 'gratis'

export type CouponType = 'percentage' | 'fixed'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category: ProductCategory
  team: string
  marca: string | null
  anio: string | null
  liga: string | null
  genero: string | null
  temporada: string | null
  tipo_producto:        string | null
  pais:                 string | null
  equipacion:           string | null
  version:              string | null
  tipografia:           string | null
  hecho_en:             string | null
  codigo_autenticidad:  string | null
  condicion:            string | null
  price: number
  compare_price: number | null
  images: string[]
  tags: string[]
  active: boolean
  featured: boolean
  created_at: string
  updated_at: string
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  size: ProductSize
  type: ProductType
  season: string
  stock: number
  sku: string | null
  created_at: string
}

export interface CartItem {
  product: Product
  variant: ProductVariant
  quantity: number
}

export interface ShippingAddress {
  full_name: string
  phone: string
  street: string
  number: string
  colonia: string
  city: string
  state: string
  zip: string
  references?: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  customer_email: string
  customer_name: string
  customer_phone: string | null
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  shipping_type: ShippingType
  shipping_address: ShippingAddress
  tracking_number: string | null
  coupon_id: string | null
  payment_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  product_image: string | null
  size: string
  type: string
  season: string
  quantity: number
  price: number
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  min_purchase: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  active: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  default_address: ShippingAddress | null
  address_street: string | null
  address_number: string | null
  address_colonia: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  address_references: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  active: boolean
  created_at: string
}

// Filtros para el catálogo
export interface ProductFilters {
  category?: ProductCategory
  team?: string
  size?: ProductSize
  type?: ProductType
  season?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'featured'
}

// Respuestas de API
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// ============================================
// COTIZACIONES
// ============================================

export type QuoteProductType =
  | 'jersey-oficial'
  | 'playera-personalizada'
  | 'sudadera'
  | 'kit-completo'
  | 'otro'

export type QuoteQuantityRange = '1-10' | '11-25' | '26-50' | '51-100' | '100+'

export type QuoteStatus = 'nuevo' | 'en_revision' | 'cotizado' | 'aceptado' | 'rechazado'

export type QuoteBudget =
  | 'menos-5000'
  | '5000-15000'
  | '15000-30000'
  | '30000-mas'
  | 'sin-definir'

export interface QuoteRequest {
  id: string
  customer_name: string
  email: string
  phone: string
  city: string
  product_type: QuoteProductType
  quantity_range: QuoteQuantityRange
  team_name: string | null
  colors: string | null
  has_logo: boolean
  player_names: string | null
  numbers: string | null
  sizes_breakdown: Record<string, number> | null
  deadline: string | null
  budget_range: QuoteBudget | null
  reference_images: string[]
  notes: string | null
  status: QuoteStatus
  quoted_price: number | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export const QUOTE_PRODUCT_TYPES: { value: QuoteProductType; label: string; emoji: string }[] = [
  { value: 'jersey-oficial',       label: 'Jersey oficial',         emoji: '👕' },
  { value: 'playera-personalizada',label: 'Playera personalizada',  emoji: '🎽' },
  { value: 'sudadera',             label: 'Sudadera',               emoji: '🧥' },
  { value: 'kit-completo',         label: 'Kit completo (jersey + short)', emoji: '⚽' },
  { value: 'otro',                 label: 'Otro / No estoy seguro', emoji: '❓' },
]

export const QUOTE_QUANTITY_RANGES: { value: QuoteQuantityRange; label: string }[] = [
  { value: '1-10',   label: '1 – 10 piezas' },
  { value: '11-25',  label: '11 – 25 piezas' },
  { value: '26-50',  label: '26 – 50 piezas' },
  { value: '51-100', label: '51 – 100 piezas' },
  { value: '100+',   label: 'Más de 100 piezas' },
]

export const QUOTE_BUDGET_RANGES: { value: QuoteBudget; label: string }[] = [
  { value: 'menos-5000',  label: 'Menos de $5,000 MXN' },
  { value: '5000-15000',  label: '$5,000 – $15,000 MXN' },
  { value: '15000-30000', label: '$15,000 – $30,000 MXN' },
  { value: '30000-mas',   label: 'Más de $30,000 MXN' },
  { value: 'sin-definir', label: 'Aún no lo tengo definido' },
]

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  nuevo:       'Nuevo',
  en_revision: 'En revisión',
  cotizado:    'Cotizado',
  aceptado:    'Aceptado',
  rechazado:   'Rechazado',
}

export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  nuevo:       'bg-blue-100 text-blue-700',
  en_revision: 'bg-yellow-100 text-yellow-700',
  cotizado:    'bg-purple-100 text-purple-700',
  aceptado:    'bg-green-100 text-green-700',
  rechazado:   'bg-red-100 text-red-700',
}

// Constantes de categorías
export const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'liga-mx', label: 'Liga MX' },
  { value: 'seleccion-mexicana', label: 'Selección Mexicana' },
  { value: 'europa', label: 'Europa' },
  { value: 'retro-vintage', label: 'Retro / Vintage' },
  { value: 'gear', label: 'Gear Deportivo' },
]

export const SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'local', label: 'Local' },
  { value: 'visitante', label: 'Visitante' },
  { value: 'tercero', label: 'Tercero' },
  { value: 'portero', label: 'Portero' },
]

export const TIPOS_PRODUCTO = ['Jersey', 'Jersey Retro', 'Entrenamiento', 'Sudadera', 'Otro'] as const

export const BRANDS = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Umbro', 'Kappa', 'Mizuno', 'Otra'] as const

export const LEAGUES = [
  'Liga MX',
  'Selección Mexicana',
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
  'Champions League',
  'Selección Internacional',
  'Otra',
] as const

export const GENDERS = ['Hombre', 'Mujer', 'Niño'] as const

export const SEASON_TYPES = [
  'Local',
  'Visitante',
  'Tercero',
  'Retro',
  'Edición Especial',
] as const

export const SHIPPING_OPTIONS: {
  type: ShippingType
  label: string
  description: string
  price: number
}[] = [
  {
    type: 'estandar',
    label: 'Envío Estándar',
    description: '4-6 días hábiles',
    price: 149,
  },
  {
    type: 'express',
    label: 'Envío Express',
    description: '1-3 días hábiles',
    price: 349,
  },
  {
    type: 'gratis',
    label: 'Envío Gratis',
    description: 'En pedidos mayores a $1,500 MXN',
    price: 0,
  },
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente de pago',
  pagado: 'Pagado',
  preparando: 'Preparando pedido',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  prueba: '🧪 Orden de prueba',
}

// ============================================
// TE COMPRAMOS TU JERSEY
// ============================================

export type JerseyCondition = 'nuevo' | 'como_nuevo' | 'buen_estado' | 'regular'

export type JerseyCompraStatus =
  | 'pendiente'
  | 'revisado'
  | 'oferta_enviada'
  | 'comprado'
  | 'rechazado'

export interface JerseyCompra {
  id: string
  customer_name: string
  email: string
  whatsapp: string
  team: string
  size: string
  season: string
  condition: JerseyCondition
  asking_price: number
  photos: string[]
  description: string | null
  status: JerseyCompraStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export const JERSEY_CONDITIONS: {
  value: JerseyCondition
  label: string
  desc: string
  stars: number
}[] = [
  { value: 'nuevo',       label: 'Nuevo',        desc: 'Sin usar, con etiquetas',     stars: 5 },
  { value: 'como_nuevo',  label: 'Como nuevo',   desc: 'Usado 1–2 veces, impecable',  stars: 4 },
  { value: 'buen_estado', label: 'Buen estado',  desc: 'Uso normal, sin defectos',    stars: 3 },
  { value: 'regular',     label: 'Regular',      desc: 'Pequeñas marcas de uso',      stars: 2 },
]

export const JERSEY_COMPRA_STATUS_LABELS: Record<JerseyCompraStatus, string> = {
  pendiente:      'Pendiente',
  revisado:       'Revisado',
  oferta_enviada: 'Oferta enviada',
  comprado:       'Comprado',
  rechazado:      'Rechazado',
}

export const JERSEY_COMPRA_STATUS_COLORS: Record<JerseyCompraStatus, string> = {
  pendiente:      'bg-blue-100 text-blue-700',
  revisado:       'bg-yellow-100 text-yellow-700',
  oferta_enviada: 'bg-purple-100 text-purple-700',
  comprado:       'bg-green-100 text-green-700',
  rechazado:      'bg-red-100 text-red-700',
}
