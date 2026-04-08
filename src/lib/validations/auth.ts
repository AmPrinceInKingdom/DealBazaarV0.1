import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required."),
    email: z.email("Please enter a valid email address."),
    phone: z.string().min(6, "Phone number is required."),
    accountType: z.enum(["customer", "seller"]),
    storeName: z.string().optional(),
    storeDescription: z.string().optional(),
    sellerReason: z.string().optional(),
    acceptTerms: z.boolean(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .superRefine((value, context) => {
    if (value.accountType === "seller") {
      if (!value.storeName || value.storeName.trim().length < 2) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["storeName"],
          message: "Store name is required for seller accounts.",
        });
      }
      if (!value.storeDescription || value.storeDescription.trim().length < 10) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["storeDescription"],
          message: "Store description must be at least 10 characters.",
        });
      }
    }

    if (!value.acceptTerms) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["acceptTerms"],
        message: "Please accept Terms and Conditions.",
      });
    }
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
