import { z } from "zod";

export const productReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(3, "Comment must be at least 3 characters.")
    .max(1000, "Comment is too long."),
  image_url: z.string().url().optional().nullable(),
});

export type ProductReviewSchema = z.infer<typeof productReviewSchema>;
