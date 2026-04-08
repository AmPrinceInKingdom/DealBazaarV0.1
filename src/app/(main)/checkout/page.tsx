import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/forms/checkout-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAuthContext } from "@/lib/auth";

export default async function CheckoutPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/checkout");
  }

  return (
    <div className="container-wrap py-8">
      <SectionHeading
        title="Checkout"
        subtitle="Complete your order with secure payment and verification."
      />
      <div className="mt-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
