import { PolicyPage } from "@/components/layout/policy-page";

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Policy"
      updatedAt="April 7, 2026"
      sections={[
        {
          heading: "Coverage",
          body: "Deal Bazaar ships worldwide to eligible regions. Delivery availability depends on destination and product type.",
        },
        {
          heading: "Delivery Timeline",
          body: "Typical fulfillment starts within 2-5 business days after payment verification. Delivery timelines vary by destination and customs handling.",
        },
        {
          heading: "Tracking",
          body: "Tracking details are shared in your account order timeline once shipment is dispatched.",
        },
      ]}
    />
  );
}
