export type LocaleCode =
  | "en"
  | "si"
  | "ta"
  | "hi"
  | "es"
  | "ar"
  | "fr"
  | "de"
  | "pt";

type Dictionary = Record<string, string>;

const englishDictionary: Dictionary = {
  "nav.home": "Home",
  "nav.products": "Products",
  "nav.contact": "Contact",
  "nav.search": "Search products...",
  "market.language": "Language",
  "market.currency": "Currency",
  "hero.badge": "Deal Bazaar Marketplace",
  "hero.cta.shop": "Shop now",
  "hero.cta.contact": "Contact sales",
  "hero.why": "Why customers choose us",
  "hero.why.1": "Verified product listings and quality checks",
  "hero.why.2": "Secure payments with upload-based verification",
  "hero.why.3": "Transparent order tracking and status updates",
  "home.featured.title": "Featured Products",
  "home.featured.subtitle":
    "Handpicked inventory promoted by the Deal Bazaar admin team.",
  "home.trending.title": "Trending Products",
  "home.trending.subtitle": "Top-selling and most viewed products this week.",
  "home.flash.title": "Flash Deals",
  "home.flash.subtitle": "Limited-time discounts. Prices can change anytime.",
  "common.viewAll": "View all",
  "footer.description":
    "Global dropshipping marketplace with secure checkout, verified inventory, and customer-first support.",
  "footer.company": "Company",
  "footer.account": "Account",
  "footer.policies": "Policies",
  "footer.rights": "All rights reserved.",
  "product.addToCart": "Add to cart",
  "product.outOfStock": "Out of stock",
  "cart.title": "Your Cart",
  "cart.view": "View cart",
  "cart.checkout": "Checkout",
  "user.dashboard": "Dashboard",
  "user.orders": "Orders",
  "user.admin": "Admin Panel",
  "user.seller": "Seller Panel",
  "user.logout": "Logout",
};

const dictionaries: Record<LocaleCode, Dictionary> = {
  en: englishDictionary,
  si: {
    ...englishDictionary,
    "nav.home": "Mula Pituwata",
    "nav.products": "Nishpadana",
    "nav.contact": "Sambandha Wanna",
    "common.viewAll": "Balanna",
    "cart.checkout": "Gewimata Yanna",
  },
  ta: {
    ...englishDictionary,
    "nav.home": "Mugappu",
    "nav.products": "Porutkal",
    "nav.contact": "Thodarpu",
  },
  hi: {
    ...englishDictionary,
    "nav.contact": "Sampark",
  },
  es: {
    ...englishDictionary,
    "nav.home": "Inicio",
    "nav.products": "Productos",
    "nav.contact": "Contacto",
    "common.viewAll": "Ver todo",
    "footer.rights": "Todos los derechos reservados.",
    "cart.checkout": "Pagar",
  },
  ar: {
    ...englishDictionary,
  },
  fr: {
    ...englishDictionary,
    "nav.home": "Accueil",
    "nav.products": "Produits",
    "common.viewAll": "Voir tout",
    "footer.rights": "Tous droits reserves.",
    "cart.checkout": "Paiement",
  },
  de: {
    ...englishDictionary,
    "nav.home": "Startseite",
    "nav.products": "Produkte",
    "nav.contact": "Kontakt",
    "common.viewAll": "Alle anzeigen",
    "footer.rights": "Alle Rechte vorbehalten.",
    "cart.checkout": "Kasse",
  },
  pt: {
    ...englishDictionary,
    "nav.home": "Inicio",
    "nav.products": "Produtos",
    "nav.contact": "Contato",
    "common.viewAll": "Ver tudo",
    "footer.rights": "Todos os direitos reservados.",
    "cart.checkout": "Finalizar",
  },
};

export function translate(key: string, locale: LocaleCode) {
  return dictionaries[locale][key] ?? englishDictionary[key] ?? key;
}
