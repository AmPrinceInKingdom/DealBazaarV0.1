import Link from "next/link";
import {
  ChartNoAxesCombined,
  PackageCheck,
  Shapes,
  ShoppingBag,
  UsersRound,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: ChartNoAxesCombined },
  { href: "/admin/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Shapes },
  { href: "/admin/orders", label: "Orders", icon: PackageCheck },
  { href: "/admin/users", label: "Users", icon: UsersRound },
];

export function AdminSidebar() {
  return (
    <aside className="surface h-fit p-3">
      <h2 className="px-3 pb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Admin Menu
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
