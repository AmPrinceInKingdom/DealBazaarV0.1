import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/account-nav";
import { getAuthContext } from "@/lib/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/account");
  }

  return (
    <div className="container-wrap py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">My Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage profile, addresses, wishlist, and orders.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
