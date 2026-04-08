import { ContactForm } from "@/components/forms/contact-form";
import { SOCIAL_LINKS } from "@/lib/constants";

export default function ContactPage() {
  return (
    <div className="container-wrap py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="surface p-6">
          <h1 className="text-3xl font-black">Contact Deal Bazaar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Need help with an order, payment verification, or product inquiry?
            Reach us anytime.
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <p>Email: support@deal-bazaar.com</p>
            <p>Operations: operations@deal-bazaar.com</p>
            <p>Response time: Within 24 hours</p>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold">Follow us</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </article>
        <article className="surface p-6">
          <h2 className="text-xl font-bold">Send a message</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </article>
      </div>
    </div>
  );
}
