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
  /** Which configurator colour (swatch id) the main photo shows. */
  photoColour?: string;
  /** Overrides the fabric/wood choice the category implies (e.g. a cane-and-oak bed is wood). */
  materialType?: "upholstery" | "wood";
  /** Photos of the piece in other colours, by swatch id; shown when that colour is picked. */
  colourImages?: Record<string, string>;
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

export type GatewayProvider = "tabby" | "tamara" | "ziina";
/**
 * pending: sent to the provider's page · authorized: approved, not yet captured (Tabby/Tamara)
 * paid: money confirmed · failed / cancelled: the attempt ended · refunded: fully refunded.
 */
export type GatewayState = "pending" | "authorized" | "paid" | "failed" | "cancelled" | "refunded";
export type GatewayPayment = {
  provider: GatewayProvider;
  ref: string; // Tabby payment id · Tamara order id · Ziina payment intent id
  state: GatewayState;
  test: boolean;
  captured: boolean;
  refunded: number; // AED refunded so far
  updatedAt: string;
  log: { at: string; note: string }[];
};

/** Keys for online payments (Admin → Payments). Admin-only: never part of public settings. */
export type PaymentsConfig = {
  mode: "test" | "live";
  tabby: { on: boolean; secretKey: string; publicKey: string; merchantCode: string; webhookSecret: string };
  tamara: { on: boolean; apiToken: string; notificationToken: string; publicKey: string };
  ziina: { on: boolean; apiKey: string; webhookSecret: string };
};

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
  payment: "cod" | "bank" | "tabby" | "tamara" | "card";
  /** Set when the customer paid online through Tabby, Tamara or Ziina (see lib/payments.ts). */
  gateway?: GatewayPayment;
  /** Set from the admin; older orders without it are treated as unpaid (or paid once delivered). */
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  notes?: string;
  /** Set when the order was placed while signed in to a customer account. */
  customerId?: string;
  /** Version (date) of the Terms of sale the customer accepted at checkout. */
  termsVersion?: string;
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

// ── Customer accounts (stored in their own D1 table, see lib/customers.ts) ──
export type Customer = {
  id: string;
  kind: "private" | "company";
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  emirate: string;
  area: string;
  address: string;
  marketing: boolean;
  /** When they agreed to the Terms and Privacy policy, and which version. */
  termsAccepted?: { at: string; version: string };
  /** When the marketing choice was last made (consent record). */
  marketingAt?: string;
  createdAt: string;
  lastLogin?: string;
};
/** What the website (browser) may know about the signed-in customer. */
export type AccountInfo = Omit<Customer, "createdAt" | "lastLogin">;

// ── Fabrics & finishes (edited in Admin → Fabrics) ──
export type Swatch = { id: string; name: L10n; hex: string };
export type Material = { id: string; name: L10n; note: L10n; delta: number; colours: Swatch[] };
/** Upholstery applies to sofas, armchairs and beds; wood & lacquer to everything else. */
export type MaterialCatalog = { upholstery: Material[]; wood: Material[] };

// ── Inspiration rooms (edited in Admin → Inspiration) ──
export type RoomKind = "living" | "bedroom" | "dining" | "kids" | "hall";
/** A product pinned on a room photo; x/y are percentages of the image. */
export type LookPin = { productId: string; x: number; y: number };
export type Look = {
  id: string;
  title: L10n;
  mood: L10n;
  image: string;
  w: number;
  h: number;
  pins: LookPin[];
  room: RoomKind;
  home: boolean; // featured in "Shop the look" on the home page
  live: boolean;
  createdAt: string;
};

// ── Order alerts (Admin → Settings → Order alerts). Admin-only: never part of public settings. ──
export type NotifyConfig = {
  events: { orders: boolean; quotes: boolean; samples: boolean; messages: boolean };
  telegram: { on: boolean; token: string; chatId: string };
  whatsapp: { on: boolean; phone: string; apiKey: string }; // via CallMeBot
  email: { on: boolean; apiKey: string; from: string; to: string; receipts: boolean }; // via Resend
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
  materials?: MaterialCatalog;
  notify?: NotifyConfig;
  payments?: PaymentsConfig;
  /** Shown in the footer and legal pages once filled in (Admin → Settings → Company & legal). */
  company?: { licence: string; authority: string; trn: string };
};

export type DB = {
  categories: Category[];
  products: Product[];
  projects: Project[];
  orders: Order[];
  requests: QuoteRequest[];
  messages: Message[];
  looks: Look[];
  settings: Settings;
  counters: { order: number; request: number };
};
