import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Order, Product } from "@/types/domain";

export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Product[];
}

export async function getSellerOrders(sellerId: string): Promise<Order[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: assignments, error: assignmentError } = await supabase
    .from("seller_orders")
    .select("order_id")
    .eq("seller_id", sellerId);

  if (assignmentError || !assignments?.length) return [];
  const orderIds = assignments.map((item) => item.order_id);

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .in("id", orderIds)
    .order("created_at", { ascending: false });

  if (error || !orders) return [];
  return orders as Order[];
}

export async function getSellerOrderById(sellerId: string, orderId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: assignment, error: assignmentError } = await supabase
    .from("seller_orders")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("order_id", orderId)
    .single();

  if (assignmentError || !assignment) return null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .eq("seller_id", sellerId);

  return {
    ...order,
    items: items ?? [],
  };
}
