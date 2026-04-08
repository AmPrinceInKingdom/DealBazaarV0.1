import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/types/domain";

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getOrderById(orderId: string, userId?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  let query = supabase.from("orders").select("*").eq("id", orderId);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: order, error: orderError } = await query.single();

  if (orderError || !order) {
    return null;
  }

  const { data: items, error: itemError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  if (itemError) {
    return {
      ...order,
      items: [],
    } as Order & { items: OrderItem[] };
  }

  return {
    ...order,
    items: items ?? [],
  } as Order & { items: OrderItem[] };
}

export async function getAllOrders() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}
