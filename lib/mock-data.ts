export interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string // added short description
  description: string
  details: string // added details field
  category: string
  categoryId: string // added category ID reference
  priceUSD: number
  comparePriceUSD?: number
  stock: number
  images: string[]
  status: "active" | "draft" | "archived"
  isOnSale: boolean // added sale flag
  salePercentage?: number // added sale percentage
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  parentId?: string
  productCount: number
  image?: string
  productIds: string[] // added product IDs array
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalSpent: number
  lastOrder?: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Offer {
  id: string
  name: string
  code: string
  type: "percentage" | "fixed"
  value: number
  minPurchase?: number
  usageLimit?: number
  usageCount: number
  startDate: string
  endDate: string
  status: "active" | "scheduled" | "expired"
}

export interface SalesData {
  date: string
  sales: number
  orders: number
  visitors: number
}

export interface CategorySales {
  category: string
  sales: number
  percentage: number
  color: string
}

export interface MonthlyComparison {
  month: string
  thisYear: number
  lastYear: number
}

export interface TopProduct {
  id: string
  name: string
  sales: number
  units: number
  growth: number
}

export interface RecentOrder {
  id: string
  customer: string
  email: string
  amount: number
  status: "completed" | "processing" | "shipped" | "cancelled"
  date: string
  items: number
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Aceite de Oliva Virgen Extra Premium",
    slug: "aceite-oliva-premium",
    shortDescription: "Aceite de primera prensada en frío con sabor intenso.",
    description:
      "Aceite de oliva de primera prensada en frío, sabor intenso y afrutado. Producido en las mejores fincas de Jaén con aceitunas seleccionadas.",
    details:
      "Origen: Jaén, España\nVariedad: Picual\nAcidez: 0.2%\nCapacidad: 500ml\nConservación: Lugar fresco y oscuro",
    category: "Aceites",
    categoryId: "1",
    priceUSD: 24.99,
    comparePriceUSD: 29.99,
    stock: 150,
    images: ["/olive-oil-bottle-premium.jpg"],
    status: "active",
    isOnSale: true,
    salePercentage: 17,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Jamón Ibérico de Bellota",
    slug: "jamon-iberico-bellota",
    shortDescription: "Jamón 100% ibérico de bellota con 36 meses de curación.",
    description:
      "Jamón ibérico 100% de bellota, curación mínima 36 meses. Procedente de cerdos criados en libertad en las dehesas extremeñas.",
    details:
      "Origen: Extremadura, España\nRaza: 100% Ibérico\nCuración: 36 meses mínimo\nPeso: 7-8 kg\nCertificación: D.O. Dehesa de Extremadura",
    category: "Embutidos",
    categoryId: "2",
    priceUSD: 189.99,
    stock: 25,
    images: ["/iberian-ham-jamon.jpg"],
    status: "active",
    isOnSale: false,
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Queso Manchego Curado",
    slug: "queso-manchego-curado",
    shortDescription: "Queso manchego D.O. con 12 meses de curación.",
    description: "Queso manchego D.O. con curación de 12 meses. Elaborado artesanalmente con leche de oveja manchega.",
    details:
      "Origen: Castilla-La Mancha, España\nLeche: Oveja manchega\nCuración: 12 meses\nPeso: 1 kg\nCertificación: D.O. Manchego",
    category: "Quesos",
    categoryId: "3",
    priceUSD: 34.5,
    comparePriceUSD: 39.99,
    stock: 80,
    images: ["/manchego-cheese-wheel.jpg"],
    status: "active",
    isOnSale: true,
    salePercentage: 14,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "Vino Tinto Reserva 2018",
    slug: "vino-reserva-2018",
    shortDescription: "Vino tinto reserva de La Rioja, 24 meses en barrica.",
    description: "Vino tinto reserva de la Rioja, envejecido 24 meses en barrica de roble francés y americano.",
    details:
      "Origen: La Rioja, España\nVariedad: Tempranillo 90%, Graciano 10%\nCrianza: 24 meses barrica\nAlcohol: 14%\nCapacidad: 750ml",
    category: "Vinos",
    categoryId: "4",
    priceUSD: 42.0,
    stock: 200,
    images: ["/rioja-red-wine.png"],
    status: "active",
    isOnSale: false,
    createdAt: "2024-01-20",
  },
  {
    id: "5",
    name: "Pack Gourmet Deluxe",
    slug: "pack-gourmet-deluxe",
    shortDescription: "Selección premium con los mejores productos españoles.",
    description:
      "Selección premium con jamón, queso, aceite y vino. El regalo perfecto para los amantes de la gastronomía española.",
    details:
      "Contenido:\n- Jamón ibérico loncheado 100g\n- Queso manchego curado 250g\n- Aceite virgen extra 250ml\n- Vino reserva 375ml\nPresentación: Caja regalo",
    category: "Packs",
    categoryId: "5",
    priceUSD: 149.99,
    comparePriceUSD: 179.99,
    stock: 30,
    images: ["/gourmet-food-basket.png"],
    status: "active",
    isOnSale: true,
    salePercentage: 17,
    createdAt: "2024-02-15",
  },
  {
    id: "6",
    name: "Miel de Azahar Ecológica",
    slug: "miel-azahar-eco",
    shortDescription: "Miel pura de azahar de producción ecológica.",
    description: "Miel pura de azahar de producción ecológica. Recolectada en los naranjales de Valencia.",
    details:
      "Origen: Valencia, España\nTipo: Azahar\nCertificación: Ecológica UE\nCapacidad: 500g\nConservación: Temperatura ambiente",
    category: "Dulces",
    categoryId: "6",
    priceUSD: 12.99,
    stock: 0,
    images: ["/organic-honey-jar.png"],
    status: "draft",
    isOnSale: false,
    createdAt: "2024-03-01",
  },
]

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Aceites",
    slug: "aceites",
    description: "Aceites de oliva y especiales",
    productCount: 12,
    productIds: ["1"],
  },
  {
    id: "2",
    name: "Embutidos",
    slug: "embutidos",
    description: "Jamones, chorizos y más",
    productCount: 18,
    productIds: ["2"],
  },
  {
    id: "3",
    name: "Quesos",
    slug: "quesos",
    description: "Quesos artesanales españoles",
    productCount: 15,
    productIds: ["3"],
  },
  {
    id: "4",
    name: "Vinos",
    slug: "vinos",
    description: "Vinos tintos, blancos y rosados",
    productCount: 24,
    productIds: ["4"],
  },
  { id: "5", name: "Packs", slug: "packs", description: "Cestas y packs regalo", productCount: 8, productIds: ["5"] },
  {
    id: "6",
    name: "Dulces",
    slug: "dulces",
    description: "Mieles, turrones y dulces",
    productCount: 10,
    productIds: ["6"],
  },
]

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "María García",
    email: "maria.garcia@email.com",
    phone: "+34 612 345 678",
    totalOrders: 12,
    totalSpent: 856.5,
    lastOrder: "2024-03-15",
    status: "active",
    createdAt: "2023-06-10",
  },
  {
    id: "2",
    name: "Carlos López",
    email: "carlos.lopez@email.com",
    phone: "+34 623 456 789",
    totalOrders: 8,
    totalSpent: 524.0,
    lastOrder: "2024-03-12",
    status: "active",
    createdAt: "2023-08-22",
  },
  {
    id: "3",
    name: "Ana Martínez",
    email: "ana.martinez@email.com",
    totalOrders: 3,
    totalSpent: 189.99,
    lastOrder: "2024-02-28",
    status: "active",
    createdAt: "2024-01-05",
  },
  {
    id: "4",
    name: "Pedro Sánchez",
    email: "pedro.sanchez@email.com",
    phone: "+34 634 567 890",
    totalOrders: 15,
    totalSpent: 1234.5,
    lastOrder: "2024-03-18",
    status: "active",
    createdAt: "2023-03-15",
  },
  {
    id: "5",
    name: "Laura Fernández",
    email: "laura.fernandez@email.com",
    totalOrders: 1,
    totalSpent: 49.99,
    status: "inactive",
    createdAt: "2024-02-20",
  },
]

export const mockOffers: Offer[] = [
  {
    id: "1",
    name: "Descuento Primavera",
    code: "SPRING20",
    type: "percentage",
    value: 20,
    minPurchase: 50,
    usageLimit: 100,
    usageCount: 45,
    startDate: "2024-03-01",
    endDate: "2024-04-30",
    status: "active",
  },
  {
    id: "2",
    name: "Envío Gratis",
    code: "FREESHIP",
    type: "fixed",
    value: 5.99,
    minPurchase: 30,
    usageCount: 120,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
  },
  {
    id: "3",
    name: "Black Friday",
    code: "BF2024",
    type: "percentage",
    value: 30,
    usageLimit: 500,
    usageCount: 0,
    startDate: "2024-11-25",
    endDate: "2024-11-30",
    status: "scheduled",
  },
  {
    id: "4",
    name: "Navidad 2023",
    code: "XMAS23",
    type: "percentage",
    value: 15,
    usageCount: 234,
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    status: "expired",
  },
]

export const salesDataDaily: SalesData[] = [
  { date: "1 Dic", sales: 1245, orders: 23, visitors: 342 },
  { date: "2 Dic", sales: 1876, orders: 31, visitors: 456 },
  { date: "3 Dic", sales: 1432, orders: 27, visitors: 398 },
  { date: "4 Dic", sales: 2134, orders: 38, visitors: 521 },
  { date: "5 Dic", sales: 1987, orders: 35, visitors: 487 },
  { date: "6 Dic", sales: 2456, orders: 42, visitors: 612 },
  { date: "7 Dic", sales: 2834, orders: 48, visitors: 734 },
  { date: "8 Dic", sales: 2267, orders: 39, visitors: 598 },
  { date: "9 Dic", sales: 2645, orders: 45, visitors: 687 },
  { date: "10 Dic", sales: 3123, orders: 52, visitors: 823 },
  { date: "11 Dic", sales: 2934, orders: 49, visitors: 756 },
  { date: "12 Dic", sales: 3456, orders: 58, visitors: 912 },
  { date: "13 Dic", sales: 2823, orders: 47, visitors: 698 },
  { date: "14 Dic", sales: 3234, orders: 54, visitors: 845 },
  { date: "15 Dic", sales: 3678, orders: 61, visitors: 967 },
  { date: "16 Dic", sales: 3145, orders: 53, visitors: 812 },
  { date: "17 Dic", sales: 3867, orders: 64, visitors: 1023 },
  { date: "18 Dic", sales: 4234, orders: 71, visitors: 1134 },
  { date: "19 Dic", sales: 3945, orders: 66, visitors: 1045 },
  { date: "20 Dic", sales: 4123, orders: 69, visitors: 1098 },
  { date: "21 Dic", sales: 3756, orders: 63, visitors: 987 },
  { date: "22 Dic", sales: 4567, orders: 76, visitors: 1234 },
  { date: "23 Dic", sales: 4876, orders: 81, visitors: 1345 },
  { date: "24 Dic", sales: 5234, orders: 87, visitors: 1456 },
  { date: "25 Dic", sales: 4678, orders: 78, visitors: 1234 },
  { date: "26 Dic", sales: 5123, orders: 85, visitors: 1367 },
]

export const categorySales: CategorySales[] = [
  { category: "Aceites", sales: 8456, percentage: 28, color: "#7dd3fc" },
  { category: "Embutidos", sales: 6234, percentage: 21, color: "#fb923c" },
  { category: "Quesos", sales: 5123, percentage: 17, color: "#fcd34d" },
  { category: "Vinos", sales: 4567, percentage: 15, color: "#a78bfa" },
  { category: "Packs", sales: 3456, percentage: 12, color: "#6ee7b7" },
  { category: "Dulces", sales: 2123, percentage: 7, color: "#f472b6" },
]

export const monthlyComparison: MonthlyComparison[] = [
  { month: "Ene", thisYear: 12500, lastYear: 10200 },
  { month: "Feb", thisYear: 14300, lastYear: 11800 },
  { month: "Mar", thisYear: 16800, lastYear: 13400 },
  { month: "Abr", thisYear: 15200, lastYear: 14100 },
  { month: "May", thisYear: 18900, lastYear: 15600 },
  { month: "Jun", thisYear: 17400, lastYear: 16200 },
  { month: "Jul", thisYear: 19800, lastYear: 17100 },
  { month: "Ago", thisYear: 16500, lastYear: 14800 },
  { month: "Sep", thisYear: 21200, lastYear: 18400 },
  { month: "Oct", thisYear: 23400, lastYear: 19800 },
  { month: "Nov", thisYear: 26800, lastYear: 22100 },
  { month: "Dic", thisYear: 32500, lastYear: 27400 },
]

export const topSellingProducts: TopProduct[] = [
  { id: "1", name: "Aceite de Oliva Virgen Extra Premium", sales: 4567, units: 183, growth: 23 },
  { id: "5", name: "Pack Gourmet Deluxe", sales: 3456, units: 23, growth: 45 },
  { id: "2", name: "Jamón Ibérico de Bellota", sales: 2845, units: 15, growth: 12 },
  { id: "3", name: "Queso Manchego Curado", sales: 2134, units: 62, growth: 8 },
  { id: "4", name: "Vino Tinto Reserva 2018", sales: 1876, units: 45, growth: -3 },
]

export const recentOrdersData: RecentOrder[] = [
  {
    id: "ORD-2024-1234",
    customer: "María García",
    email: "maria.garcia@email.com",
    amount: 156.5,
    status: "completed",
    date: "2024-12-26",
    items: 3,
  },
  {
    id: "ORD-2024-1233",
    customer: "Carlos López",
    email: "carlos.lopez@email.com",
    amount: 89.99,
    status: "shipped",
    date: "2024-12-26",
    items: 2,
  },
  {
    id: "ORD-2024-1232",
    customer: "Ana Martínez",
    email: "ana.martinez@email.com",
    amount: 234.0,
    status: "processing",
    date: "2024-12-25",
    items: 4,
  },
  {
    id: "ORD-2024-1231",
    customer: "Pedro Sánchez",
    email: "pedro.sanchez@email.com",
    amount: 45.5,
    status: "completed",
    date: "2024-12-25",
    items: 1,
  },
  {
    id: "ORD-2024-1230",
    customer: "Laura Fernández",
    email: "laura.fernandez@email.com",
    amount: 312.0,
    status: "completed",
    date: "2024-12-24",
    items: 5,
  },
  {
    id: "ORD-2024-1229",
    customer: "Diego Ruiz",
    email: "diego.ruiz@email.com",
    amount: 78.99,
    status: "cancelled",
    date: "2024-12-24",
    items: 2,
  },
  {
    id: "ORD-2024-1228",
    customer: "Carmen Torres",
    email: "carmen.torres@email.com",
    amount: 189.99,
    status: "shipped",
    date: "2024-12-23",
    items: 1,
  },
  {
    id: "ORD-2024-1227",
    customer: "Roberto Díaz",
    email: "roberto.diaz@email.com",
    amount: 267.5,
    status: "completed",
    date: "2024-12-23",
    items: 4,
  },
]

export const weeklyStats = {
  totalSales: 32456.78,
  totalOrders: 234,
  avgOrderValue: 138.7,
  conversionRate: 3.8,
  newCustomers: 45,
  returningCustomers: 189,
}

export const trafficSources = [
  { source: "Búsqueda Orgánica", visits: 4523, percentage: 42 },
  { source: "Redes Sociales", visits: 2134, percentage: 20 },
  { source: "Directo", visits: 1876, percentage: 17 },
  { source: "Email Marketing", visits: 1234, percentage: 11 },
  { source: "Referidos", visits: 1087, percentage: 10 },
]
