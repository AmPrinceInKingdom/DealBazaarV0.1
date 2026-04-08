import { PolicyPage } from "@/components/layout/policy-page";

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms and Conditions"
      updatedAt="April 7, 2026"
      sections={[
        {
          heading: "Use of Service",
          body: "By using Deal Bazaar, you agree to provide accurate details, maintain account security, and comply with all applicable laws.",
        },
        {
          heading: "Orders and Pricing",
          body: "Prices and availability may change without notice. Orders are confirmed after successful payment review and stock verification.",
        },
        {
          heading: "Limitations",
          body: "Deal Bazaar is not liable for delays caused by customs, carrier disruptions, or force majeure events beyond operational control.",
        },
      ]}
    />
  );
}
