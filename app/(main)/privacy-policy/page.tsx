import { PolicyPage } from "@/components/layout/policy-page";

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      updatedAt="April 7, 2026"
      sections={[
        {
          heading: "Information We Collect",
          body: "Deal Bazaar collects account, order, payment proof, and communication data to process purchases and support customer requests.",
        },
        {
          heading: "How We Use Data",
          body: "We use collected data for account authentication, order fulfillment, fraud prevention, and service improvements. We do not sell personal data.",
        },
        {
          heading: "Data Security",
          body: "We apply secure storage, role-based access, and encrypted data transfer. Access is restricted to authorized operational/admin personnel only.",
        },
      ]}
    />
  );
}
