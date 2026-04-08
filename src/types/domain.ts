export type StockStatus = "in_stock" | "out_of_stock" | "low_stock";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "bank_transfer" | "card" | "cod";
export type PaymentStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  created_at?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  seller_id?: string | null;
  category?: Category;
  price: number;
  old_price?: number | null;
  discount?: number | null;
  stock_quantity: number;
  stock_status: StockStatus;
  sku: string;
  short_description: string;
  full_description: string;
  specifications: Record<string, string>;
  main_image: string;
  gallery_images: string[];
  video_url?: string | null;
  featured: boolean;
  related_product_ids?: string[];
  created_at?: string;
};

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  image_url?: string | null;
  created_at?: string;
  user?: {
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

export type CartItem = Product & {
  quantity: number;
};

export type Address = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country: string;
  is_default?: boolean;
  created_at?: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  seller_id?: string | null;
  product_name: string;
  product_slug: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
  coupon_id?: string | null;
  coupon_code?: string | null;
  notes?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  created_at?: string;
  items?: OrderItem[];
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at?: string;
  product?: Product;
};

export type UserProfile = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  role: "customer" | "admin" | "seller" | "super_admin";
  avatar_url?: string | null;
  preferred_currency?:
    | "USD"
    | "EUR"
    | "GBP"
    | "LKR"
    | "INR"
    | "JPY"
    | "AUD"
    | "CAD"
    | "AED"
    | "SGD"
    | "CNY"
    | "MYR"
    | null;
  preferred_language?:
    | "en"
    | "si"
    | "ta"
    | "hi"
    | "es"
    | "ar"
    | "fr"
    | "de"
    | "pt"
    | null;
  created_at?: string;
};

export type SellerOrder = {
  id: string;
  order_id: string;
  seller_id: string;
  status: OrderStatus;
  created_at?: string;
  updated_at?: string;
};

export type SellerRequestStatus = "pending" | "approved" | "rejected";

export type SellerRequest = {
  id: string;
  user_id: string;
  store_name: string;
  store_description?: string | null;
  reason?: string | null;
  status: SellerRequestStatus;
  review_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Coupon = {
  id: string;
  code: string;
  description?: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_total: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};
