import Link from "next/link";
import { Package, ShoppingBag, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/products", label: "My Products", icon: ShoppingBag },
  { href: "/seller/orders", label: "My Orders", icon: Package },
];

export function SellerSidebar() {
  return (
    <aside className="surface h-fit p-3">
      <h2 className="px-3 pb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Seller Menu
      </h2>
      <ul className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                <Icon className="h-4 w-4 text-primary" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
