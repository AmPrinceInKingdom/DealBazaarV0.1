import { AddressManager } from "@/components/forms/address-manager";
import { getAuthContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AddressesPage() {
  const auth = await getAuthContext();
  const supabase = await createSupabaseServerClient();

  const addresses =
    auth && supabase
      ? await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false })
      : { data: [] };

  return (
    <AddressManager
      initialAddresses={addresses.data ?? []}
      userId={auth?.user.id ?? ""}
    />
  );
}
