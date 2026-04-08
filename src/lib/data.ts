import type { Category, Product } from "@/types/domain";
import { getDiscountPercentage, slugify } from "@/lib/utils";

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Smart Gadgets",
    slug: "smart-gadgets",
    description: "Wearables, smart home, and productivity electronics.",
    image_url:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "cat-2",
    name: "Home Essentials",
    slug: "home-essentials",
    description: "Useful and stylish products for modern homes.",
    image_url:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "cat-3",
    name: "Fashion & Lifestyle",
    slug: "fashion-lifestyle",
    description: "Daily fashion picks for all seasons.",
    image_url:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "cat-4",
    name: "Fitness & Wellness",
    slug: "fitness-wellness",
    description: "Wellness tools and active lifestyle accessories.",
    image_url:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  },
];

const gallerySet = (query: string) =>
  [1, 2, 3, 4, 5].map(
    (idx) =>
      `https://images.unsplash.com/${query}?auto=format&fit=crop&w=${800 + idx * 20}&q=80`,
  );

type ProductSeed = Omit<
  Product,
  | "id"
  | "slug"
  | "discount"
  | "stock_status"
  | "category"
  | "related_product_ids"
  | "gallery_images"
> & { galleryKey: string };

const productSeeds: ProductSeed[] = [
  {
    name: "Nova Pro Wireless Earbuds",
    category_id: "cat-1",
    price: 48,
    old_price: 69,
    stock_quantity: 64,
    sku: "DB-NOVA-EARBUD",
    short_description: "ANC earbuds with 42-hour battery life.",
    full_description:
      "Nova Pro delivers premium sound with adaptive noise cancellation, dual-device pairing, and fast USB-C charging.",
    specifications: {
      Battery: "42 hours total",
      Bluetooth: "5.3",
      ANC: "Hybrid active cancellation",
      Warranty: "12 months",
    },
    main_image:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1f9?auto=format&fit=crop&w=1200&q=80",
    galleryKey: "photo-1585386959984-a4155224a1f9",
    video_url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    featured: true,
  },
  {
    name: "AeroCharge 3-in-1 Dock",
    category_id: "cat-1",
    price: 55,
    old_price: 80,
    stock_quantity: 32,
    sku: "DB-AERO-DOCK",
    short_description: "Wireless dock for phone, watch, and earbuds.",
    full_description:
      "Charge your entire Apple/Android setup from one premium aluminum stand with overheat protection.",
    specifications: {
      Output: "15W + 5W + 2.5W",
      Material: "Aluminum alloy",
      Compatibility: "Qi-enabled devices",
      Cable: "Included",
    },
    main_image:
      "https://images.unsplash.com/photo-1582719478185-2f7a89f4f562?auto=format&fit=crop&w=1200&q=80",
    galleryKey: "photo-1582719478185-2f7a89f4f562",
    featured: true,
  },
  {
    name: "Minimal Linen Bed Set",
    category_id: "cat-2",
    price: 72,
    old_price: 95,
    stock_quantity: 24,
    sku: "DB-LINEN-SET",
    short_description: "Breathable premium linen for all seasons.",
    full_description:
      "Stone-washed linen set with soft texture and temperature control for year-round comfort.",
    specifications: {
      Material: "100% linen",
      Pieces: "4-piece set",
      Care: "Machine washable",
      Sizes: "Queen, King",
    },
    main_image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    galleryKey: "photo-1505693416388-ac5ce068fe85",
    featured: false,
  },
  {
    name: "Kitchen Smart Scale",
    category_id: "cat-2",
    price: 29,
    old_price: 39,
    stock_quantity: 78,
    sku: "DB-KITCH-SCALE",
    short_description: "Precision scale with nutrition app sync.",
    full_description:
      "Track macros and portions with a compact smart scale that syncs to mobile apps for meal planning.",
    specifications: {
      Capacity: "5kg",
      Precision: "1g",
      Display: "Backlit LED",
      Connectivity: "Bluetooth",
    },
    main_image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
    galleryKey: "photo-1610701596007-11502861dcfa",
    featured: true,
  },
  {
    name: "Urban Street Messenger Bag",
    category_id: "cat-3",
    price: 44,
    old_price: 62,
    stock_quantity: 41,
    sku: "DB-URBAN-BAG",
    short_description: "Water-resistant travel and daily carry bag.",
    full_description:
      "Modern compact messenger bag with hidden pockets, padded tablet sleeve, and premium zip hardware.",
    specifications: {
      Material: "Water-resistant canvas",
      Capacity: "8L",
      Strap: "Adjustable crossbody",
      Compartments: "6",
    },
    main_image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    galleryKey: "photo-1542291026-7eec264c27ff",
    featured: false,
  },
  {
    name: "Contour Smart Watch",
    category_id: "cat-4",
    price: 89,
    old_price: 129,
    stock_quantity: 16,
    sku: "DB-CONTOUR-WATCH",
    short_description: "Heart-rate, sleep, and activity tracking.",
    full_description:
      "Contour smart watch features AMOLED display, 5ATM resistance, and all-day health monitoring.",
    specifications: {
      Display: "1.43 inch AMOLED",
      Battery: "10 days",
      Waterproof: "5ATM",
      Sensors: "HR, SpO2, sleep",
    },
    main_image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    galleryKey: "photo-1523275335684-37898b6baf30",
    featured: true,
  },
  {
    name: "CoreFlex Resistance Bands Kit",
    category_id: "cat-4",
    price: 24,
    old_price: 35,
    stock_quantity: 92,
    sku: "DB-COREFLEX-BANDS",
    short_description: "Portable full-body workout resistance kit.",
    full_description:
      "A complete resistance training set designed for home workouts, travel, and progressive training.",
    specifications: {
      Levels: "5 resistance levels",
      Material: "Natural latex",
      Accessories: "Door anchor + handles",
      Use: "Home and travel",
    },
    main_image:
      "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=1200&q=80",
    galleryKey: "photo-1598971639058-fab3c3109a00",
    featured: false,
  },
  {
    name: "Aura Desk Lamp Pro",
    category_id: "cat-2",
    price: 36,
    old_price: 52,
    stock_quantity: 52,
    sku: "DB-AURA-LAMP",
    short_description: "Flicker-free LED desk lamp with USB output.",
    full_description:
      "Enhance your workspace with an adjustable lamp featuring five color modes and brightness control.",
    specifications: {
      Power: "12W",
      Modes: "5 color temperatures",
      Charging: "USB-A output",
      Lifetime: "50,000 hours",
    },
    main_image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
    galleryKey: "photo-1507473885765-e6ed057f782c",
    featured: true,
  },
];

export const mockProducts: Product[] = productSeeds.map((product, idx) => {
  const discount = getDiscountPercentage(product.price, product.old_price);

  return {
    ...product,
    id: `prod-${idx + 1}`,
    seller_id: null,
    slug: slugify(product.name),
    discount,
    stock_status:
      product.stock_quantity === 0
        ? "out_of_stock"
        : product.stock_quantity < 15
          ? "low_stock"
          : "in_stock",
    gallery_images: gallerySet(product.galleryKey),
    related_product_ids: [],
  };
});

const productIds = mockProducts.map((product) => product.id);

mockProducts.forEach((product) => {
  product.related_product_ids = productIds
    .filter((id) => id !== product.id)
    .slice(0, 4);
  product.category = mockCategories.find((cat) => cat.id === product.category_id);
});

export const trustBadges = [
  {
    title: "Secure Checkout",
    text: "256-bit SSL encryption and verified payment processing.",
  },
  {
    title: "Global Shipping",
    text: "Shipping to over 120 countries with tracked delivery.",
  },
  {
    title: "Quality Assurance",
    text: "Admin-verified products before listing on Deal Bazaar.",
  },
  {
    title: "Fast Support",
    text: "Response within 24 hours for all order and payment queries.",
  },
];
