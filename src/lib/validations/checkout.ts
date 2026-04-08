import { z } from "zod";

export const checkoutItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  main_image: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Customer name is required."),
  phone: z.string().min(6, "Phone is required."),
  email: z.email("Please enter a valid email address."),
  address: z.string().min(8, "Shipping address is required."),
  notes: z.string().max(500).optional().or(z.literal("")),
  coupon_code: z.string().max(50).optional().or(z.literal("")),
  payment_method: z.enum(["bank_transfer", "card", "cod"]),
  payment_proof_url: z.string().optional().or(z.literal("")),
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty."),
});

export const paymentStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "under_review"]),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;
