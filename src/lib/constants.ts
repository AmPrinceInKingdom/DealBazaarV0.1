export const SITE_NAME = "Deal Bazaar";

export const BANK_DETAILS = {
  accountName: "Deal Bazaar Holdings",
  accountNumber: "1289 5543 2201",
  bankName: "Global Commerce Bank",
  swiftCode: "GCBLUS33",
  branch: "International Trade Branch",
};

export const NAV_LINKS = [
  { label: "Home", href: "/", key: "nav.home" },
  { label: "Products", href: "/products", key: "nav.products" },
  { label: "Contact", href: "/contact", key: "nav.contact" },
];

export const FOOTER_LINKS = {
  company: [
    { label: "About Deal Bazaar", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
  ],
  account: [
    { label: "My Account", href: "/account" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
    { label: "Orders", href: "/account/orders" },
  ],
};

export const SOCIAL_LINKS = [
  {
    label: "Facebook",
    shortLabel: "FB",
    href: "https://facebook.com/dealbazaarglobal",
  },
  {
    label: "Instagram",
    shortLabel: "IG",
    href: "https://instagram.com/dealbazaarglobal",
  },
  {
    label: "TikTok",
    shortLabel: "TT",
    href: "https://tiktok.com/@dealbazaarglobal",
  },
  {
    label: "Telegram",
    shortLabel: "TG",
    href: "https://t.me/dealbazaarglobal",
  },
  {
    label: "WhatsApp",
    shortLabel: "WA",
    href: "https://wa.me/94700000000",
  },
  {
    label: "YouTube",
    shortLabel: "YT",
    href: "https://youtube.com/@dealbazaarglobal",
  },
] as const;
