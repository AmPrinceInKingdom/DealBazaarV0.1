import { CartPageContent } from "@/components/cart/cart-page";
import { SectionHeading } from "@/components/ui/section-heading";

export default function CartPage() {
  return (
    <div className="container-wrap py-8">
      <SectionHeading
        title="Shopping Cart"
        subtitle="Review your selected items before checkout."
      />
      <div className="mt-6">
        <CartPageContent />
      </div>
    </div>
  );
}
