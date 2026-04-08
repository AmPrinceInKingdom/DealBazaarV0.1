export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: "customer" | "admin" | "seller" | "super_admin";
          avatar_url: string | null;
          preferred_currency:
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
          preferred_language:
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "customer" | "admin" | "seller" | "super_admin";
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
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          role?: "customer" | "admin" | "seller" | "super_admin";
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
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category_id: string;
          seller_id: string | null;
          price: number;
          old_price: number | null;
          discount: number | null;
          stock_quantity: number;
          stock_status: "in_stock" | "out_of_stock" | "low_stock";
          sku: string;
          short_description: string;
          full_description: string;
          specifications: Json;
          main_image: string;
          gallery_images: string[];
          video_url: string | null;
          featured: boolean;
          related_product_ids: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category_id: string;
          seller_id?: string | null;
          price: number;
          old_price?: number | null;
          discount?: number | null;
          stock_quantity: number;
          stock_status?: "in_stock" | "out_of_stock" | "low_stock";
          sku: string;
          short_description: string;
          full_description: string;
          specifications?: Json;
          main_image: string;
          gallery_images?: string[];
          video_url?: string | null;
          featured?: boolean;
          related_product_ids?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          category_id?: string;
          seller_id?: string | null;
          price?: number;
          old_price?: number | null;
          discount?: number | null;
          stock_quantity?: number;
          stock_status?: "in_stock" | "out_of_stock" | "low_stock";
          sku?: string;
          short_description?: string;
          full_description?: string;
          specifications?: Json;
          main_image?: string;
          gallery_images?: string[];
          video_url?: string | null;
          featured?: boolean;
          related_product_ids?: string[] | null;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string | null;
          postal_code: string | null;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
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
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          phone?: string;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: "percentage" | "fixed";
          discount_value: number;
          min_order_total: number;
          max_discount_amount: number | null;
          usage_limit: number | null;
          used_count: number;
          starts_at: string | null;
          ends_at: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type: "percentage" | "fixed";
          discount_value: number;
          min_order_total?: number;
          max_discount_amount?: number | null;
          usage_limit?: number | null;
          used_count?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          description?: string | null;
          discount_type?: "percentage" | "fixed";
          discount_value?: number;
          min_order_total?: number;
          max_discount_amount?: number | null;
          usage_limit?: number | null;
          used_count?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_status: "pending" | "under_review" | "approved" | "rejected";
          payment_method: "bank_transfer" | "card" | "cod";
          subtotal: number;
          shipping_fee: number;
          discount_amount: number;
          total: number;
          coupon_id: string | null;
          coupon_code: string | null;
          notes: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          shipping_address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_status?: "pending" | "under_review" | "approved" | "rejected";
          payment_method: "bank_transfer" | "card" | "cod";
          subtotal: number;
          shipping_fee?: number;
          discount_amount?: number;
          total: number;
          coupon_id?: string | null;
          coupon_code?: string | null;
          notes?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          shipping_address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_status?: "pending" | "under_review" | "approved" | "rejected";
          payment_method?: "bank_transfer" | "card" | "cod";
          subtotal?: number;
          shipping_fee?: number;
          discount_amount?: number;
          total?: number;
          coupon_id?: string | null;
          coupon_code?: string | null;
          notes?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string;
          shipping_address?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          seller_id: string | null;
          product_name: string;
          product_slug: string;
          product_image: string;
          unit_price: number;
          quantity: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          seller_id?: string | null;
          product_name: string;
          product_slug: string;
          product_image: string;
          unit_price: number;
          quantity: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          seller_id?: string | null;
          quantity?: number;
          subtotal?: number;
        };
      };
      seller_orders: {
        Row: {
          id: string;
          order_id: string;
          seller_id: string;
          status:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          seller_id: string;
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          updated_at?: string;
        };
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string;
          image_url?: string | null;
          updated_at?: string;
        };
      };
      seller_profiles: {
        Row: {
          user_id: string;
          store_name: string;
          store_description: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          store_name: string;
          store_description?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          store_name?: string;
          store_description?: string | null;
          contact_phone?: string | null;
          updated_at?: string;
        };
      };
      seller_requests: {
        Row: {
          id: string;
          user_id: string;
          store_name: string;
          store_description: string | null;
          reason: string | null;
          status: "pending" | "approved" | "rejected";
          reviewed_by: string | null;
          review_note: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_name: string;
          store_description?: string | null;
          reason?: string | null;
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          store_name?: string;
          store_description?: string | null;
          reason?: string | null;
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          product_id?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          method: "bank_transfer" | "card" | "cod";
          status: "pending" | "under_review" | "approved" | "rejected";
          proof_url: string | null;
          instructions: string | null;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          method: "bank_transfer" | "card" | "cod";
          status?: "pending" | "under_review" | "approved" | "rejected";
          proof_url?: string | null;
          instructions?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          method?: "bank_transfer" | "card" | "cod";
          status?: "pending" | "under_review" | "approved" | "rejected";
          proof_url?: string | null;
          instructions?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      consume_coupon: {
        Args: { p_coupon_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
};
