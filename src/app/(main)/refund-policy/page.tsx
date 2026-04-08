import { PolicyPage } from "@/components/layout/policy-page";

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      updatedAt="April 7, 2026"
      sections={[
        {
          heading: "Eligible Refund Cases",
          body: "Refunds may be approved for wrong item delivery, damaged goods, or non-delivery confirmed by logistics records.",
        },
        {
          heading: "Refund Request Window",
          body: "Submit refund requests within 7 days of receiving your order. Include order number and clear supporting evidence.",
        },
        {
          heading: "Processing Time",
          body: "Approved refunds are processed within 5-10 business days to the original payment channel whenever available.",
        },
      ]}
    />
  );
}
