import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SellerRequestManager } from "@/components/admin/seller-request-manager";

type SellerRequestWithUser = {
  id: string;
  user_id: string;
  store_name: string;
  store_description: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    phone: string | null;
  } | null;
};

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient();
  const users = supabase
    ? await supabase.from("users").select("*").order("created_at", { ascending: false })
    : { data: [] };
  const requests = supabase
    ? await supabase
        .from("seller_requests")
        .select("*, user:users(full_name, phone)")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div className="surface overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email / ID</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.data?.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="px-4 py-3">{user.full_name || "-"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{user.id}</td>
                  <td className="px-4 py-3">{user.phone || "-"}</td>
                  <td className="px-4 py-3">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SellerRequestManager
        initialRequests={(requests.data ?? []) as SellerRequestWithUser[]}
      />
    </div>
  );
}
