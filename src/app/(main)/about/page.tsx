export default function AboutPage() {
  return (
    <div className="container-wrap py-10">
      <article className="mx-auto max-w-4xl space-y-5">
        <h1 className="text-4xl font-black">About Deal Bazaar</h1>
        <p className="text-muted-foreground">
          Deal Bazaar is a modern dropshipping marketplace built for global
          customers. We focus on secure transactions, verified products, and
          transparent order processing through a centralized admin-managed
          catalog.
        </p>
        <p className="text-muted-foreground">
          Our mission is to combine competitive pricing with trusted service. Each
          listing goes through validation checks before going live, and every
          payment is reviewed with clear status tracking.
        </p>
        <div className="surface p-6">
          <h2 className="text-xl font-bold">What makes us different</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Admin-reviewed product quality before publishing.</li>
            <li>Payment verification workflow for higher transaction safety.</li>
            <li>Responsive support and transparent order status updates.</li>
            <li>Mobile-first experience optimized for global shoppers.</li>
          </ul>
        </div>
      </article>
    </div>
  );
}
