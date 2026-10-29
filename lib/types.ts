export type Lang = "en" | "ar";
export type L10n = { en: string; ar: string };

export type Category = {
  id: string;
  slug: string;
  name: L10n;
  blurb: L10n;
  image: string;
  order: number;
};

export type Finish = { name: L10n; hex: string };

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: L10n;
  category: string; // category slug
  price: number; // AED, VAT inclusive
  salePrice?: number | null;
  priceOnRequest?: boolean;
  stock: number;
  images: string[];
  description: L10n;
  materials: L10n;
  dimensions: string;
  leadTimeDays: number;
  finishes: Finish[];
  sizes: string[];
  featured: boolean;
  isNew: boolean;
  status: "active" | "draft";
  rating: number;
  reviews: number;
  createdAt: string;
};

export type Sector =
  | "retail"
  | "fnb"
  | "office"
  | "hospitality"
  | "residential"
  | "automotive"
  | "accommodation";

export type ProjectImage = { src: string; w: number; h: number };

export type Project = {
  id: string;
  slug: string;
  client: string;
  title: L10n;
  sector: Sector;
  scope: L10n;
  location: L10n;
  emirate: string;
  summary: L10n;
  images: ProjectImage[];
  featured: boolean;
  order: number;
  createdAt: string;
};

export type OrderStatus =
  | "new"
  | "confirmed"
  | "production"
  | "delivery"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  finish?: string;
  size?: string;
};

export type PaymentStatus = "unpaid" | "deposit" | "paid";

export type Order = {
  id: string;
  number: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    emirate: string;
    area: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  vat: number; // VAT portion included in total
  total: number;
  payment: "cod" | "bank" | "tabby" | "tamara";
  /** Set from the admin; older orders without it are treated as unpaid (or paid once delivered). */
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  notes?: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: string }[];
  createdAt: string;
};

export type RequestStatus = "new" | "contacted" | "visit" | "quoted" | "won" | "lost";

export type QuoteRequest = {
  id: string;
  number: string;
  service: "fitout" | "furniture" | "technical" | "custom" | "samples";
  space: string;
  area?: string;
  emirate: string;
  budget: string;
  timeline: string;
  details: string;
  product?: string;
  files: string[];
  contact: { name: string; company?: string; phone: string; email: string };
  status: RequestStatus;
  notes: { text: string; at: string }[];
  value?: number;
  createdAt: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type Settings = {
  phone: string;
  mobile: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: L10n;
  hours: L10n;
  announcement: L10n;
  freeDeliveryOver: number;
  deliveryFees: Record<string, number>;
  bank: { name: string; iban: string; account: string };
};

export type DB = {
  categories: Category[];
  products: Product[];
  projects: Project[];
  orders: Order[];
  requests: QuoteRequest[];
  messages: Message[];
  settings: Settings;
  counters: { order: number; request: number };
};
