import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/services/products";
import { getCategories } from "@/lib/services/categories";

export async function getAdminDashboardStats() {
  const supabase = await createSupabaseServerClient();
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);

  if (!supabase) {
    return {
      products: products.length,
      categories: categories.length,
      totalOrders: 0,
      pendingPayments: 0,
      customers: 0,
    };
  }

  const [{ count: orderCount }, { count: pendingPayments }, { count: customers }] =
    await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .neq("payment_status", "approved"),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "customer"),
    ]);

  return {
    products: products.length,
    categories: categories.length,
    totalOrders: orderCount ?? 0,
    pendingPayments: pendingPayments ?? 0,
    customers: customers ?? 0,
  };
}

export async function getAdminAnalytics() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      totalRevenue: 0,
      revenue30d: 0,
      totalOrders: 0,
      approvedPayments: 0,
      pendingPayments: 0,
      averageOrderValue: 0,
      topCategories: [] as Array<{ category_id: string; count: number }>,
      topSellers: [] as Array<{ seller_id: string; seller_name: string; count: number }>,
      recentOrders: [] as Array<{
        id: string;
        order_number: string;
        total: number;
        payment_status: string;
        created_at: string;
      }>,
    };
  }

  const [ordersResult, orderItemsResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, total, payment_status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("order_items").select("product_id, seller_id"),
  ]);

  const orders = ordersResult.data ?? [];
  const approvedOrders = orders.filter((order) => order.payment_status === "approved");
  const totalRevenue = approvedOrders
    .reduce((sum, order) => sum + Number(order.total), 0);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const revenue30d = approvedOrders
    .filter((order) => new Date(order.created_at) >= thirtyDaysAgo)
    .reduce((sum, order) => sum + Number(order.total), 0);
  const approvedPayments = approvedOrders.length;
  const pendingPayments = orders.filter(
    (order) => order.payment_status !== "approved",
  ).length;
  const averageOrderValue =
    approvedOrders.length > 0 ? totalRevenue / approvedOrders.length : 0;

  const productIds = (orderItemsResult.data ?? []).map((item) => item.product_id);

  let topCategories: Array<{ category_id: string; count: number }> = [];
  if (productIds.length) {
    const { data: products } = await supabase
      .from("products")
      .select("id, category_id")
      .in("id", productIds);

    const countByCategory = new Map<string, number>();
    (products ?? []).forEach((product) => {
      countByCategory.set(
        product.category_id,
        (countByCategory.get(product.category_id) ?? 0) + 1,
      );
    });
    topCategories = Array.from(countByCategory.entries())
      .map(([category_id, count]) => ({ category_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  const sellerCountMap = new Map<string, number>();
  (orderItemsResult.data ?? []).forEach((item) => {
    if (!item.seller_id) return;
    sellerCountMap.set(
      item.seller_id,
      (sellerCountMap.get(item.seller_id) ?? 0) + 1,
    );
  });

  const topSellerIds = Array.from(sellerCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sellerId]) => sellerId);

  const sellerProfileMap = new Map<string, string>();
  if (topSellerIds.length) {
    const { data: sellers } = await supabase
      .from("users")
      .select("id, full_name")
      .in("id", topSellerIds);
    (sellers ?? []).forEach((seller) => {
      sellerProfileMap.set(seller.id, seller.full_name ?? "Unnamed seller");
    });
  }

  const topSellers = Array.from(sellerCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([seller_id, count]) => ({
      seller_id,
      seller_name: sellerProfileMap.get(seller_id) ?? "Unnamed seller",
      count,
    }));

  return {
    totalRevenue,
    revenue30d,
    totalOrders: orders.length,
    approvedPayments,
    pendingPayments,
    averageOrderValue,
    topCategories,
    topSellers,
    recentOrders: orders.slice(0, 8),
  };
}
