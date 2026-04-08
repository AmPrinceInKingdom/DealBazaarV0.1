import Link from "next/link";
import { UserRound, MapPinned, PackageSearch } from "lucide-react";

const links = [
  { href: "/account", label: "Dashboard", icon: UserRound },
  { href: "/account/profile", label: "Profile", icon: UserRound },
  { href: "/account/addresses", label: "Addresses", icon: MapPinned },
  { href: "/account/orders", label: "Orders", icon: PackageSearch },
];

export function AccountNav() {
  return (
    <nav className="surface h-fit p-3">
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
    </nav>
  );
}
