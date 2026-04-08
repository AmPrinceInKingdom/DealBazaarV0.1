import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  category_id: z.string().uuid("Select a valid category."),
  seller_id: z.string().uuid().optional().nullable(),
  price: z.coerce.number().positive(),
  old_price: z.coerce.number().positive().optional().nullable(),
  stock_quantity: z.coerce.number().int().nonnegative(),
  sku: z.string().min(3),
  short_description: z.string().min(10),
  full_description: z.string().min(20),
  specifications: z.record(z.string(), z.string()),
  main_image: z.string().url(),
  gallery_images: z.array(z.string().url()).min(1).max(5),
  video_url: z.string().url().optional().nullable(),
  featured: z.coerce.boolean().default(false),
  related_product_ids: z.array(z.string().uuid()).optional(),
});
