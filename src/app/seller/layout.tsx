import { redirect } from "next/navigation";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Navbar } from "@/components/layout/navbar";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { getAuthContext } from "@/lib/auth";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/seller");
  }

  if (
    auth.profile?.role !== "seller" &&
    auth.profile?.role !== "admin" &&
    auth.profile?.role !== "super_admin"
  ) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-wrap py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-black">Seller Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage your catalog and orders from one place.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <SellerSidebar />
            <div>{children}</div>
          </div>
        </div>
      </main>
      <CartDrawer />
    </div>
  );
}
