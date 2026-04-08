import { redirect } from "next/navigation";
import { WishlistPageContent } from "@/components/account/wishlist-page";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAuthContext } from "@/lib/auth";

export default async function WishlistPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/wishlist");
  }

  return (
    <div className="container-wrap py-8">
      <SectionHeading
        title="Wishlist"
        subtitle="Saved products for your next purchase."
      />
      <div className="mt-6">
        <WishlistPageContent />
      </div>
    </div>
  );
}
