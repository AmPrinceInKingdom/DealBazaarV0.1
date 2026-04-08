"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { registerSchema, type RegisterSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { GoogleAuthButton } from "@/components/forms/google-auth-button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      accountType: "customer",
      storeName: "",
      storeDescription: "",
      sellerReason: "",
      acceptTerms: false,
      password: "",
      confirmPassword: "",
    },
  });

  const accountType = useWatch({
    control: form.control,
    name: "accountType",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          phone: values.phone,
          requested_role: values.accountType,
          store_name: values.accountType === "seller" ? values.storeName : null,
          store_description:
            values.accountType === "seller" ? values.storeDescription : null,
          seller_reason: values.accountType === "seller" ? values.sellerReason : null,
        },
      },
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      values.accountType === "seller"
        ? "Seller account created. You can still use customer features too."
        : "Registration successful. Please verify your email.",
    );
    router.push("/login");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Account type</label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border p-3">
            <input
              type="radio"
              value="customer"
              {...form.register("accountType")}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-semibold">Customer</span>
              <span className="text-xs text-muted-foreground">
                Buy products, track orders, and manage wishlist.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border p-3">
            <input
              type="radio"
              value="seller"
              {...form.register("accountType")}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-semibold">Seller</span>
              <span className="text-xs text-muted-foreground">
                Sell products and still keep all customer features.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Full name</label>
        <Input {...form.register("fullName")} />
        <p className="mt-1 text-xs text-danger">
          {form.formState.errors.fullName?.message}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <Input type="email" {...form.register("email")} />
          <p className="mt-1 text-xs text-danger">{form.formState.errors.email?.message}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <Input {...form.register("phone")} />
          <p className="mt-1 text-xs text-danger">{form.formState.errors.phone?.message}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <Input type="password" {...form.register("password")} />
          <p className="mt-1 text-xs text-danger">
            {form.formState.errors.password?.message}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Confirm password</label>
          <Input type="password" {...form.register("confirmPassword")} />
          <p className="mt-1 text-xs text-danger">
            {form.formState.errors.confirmPassword?.message}
          </p>
        </div>
      </div>

      {accountType === "seller" ? (
        <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-semibold">Seller details</p>
          <div>
            <label className="mb-1 block text-sm font-medium">Store name</label>
            <Input placeholder="Your store name" {...form.register("storeName")} />
            <p className="mt-1 text-xs text-danger">
              {form.formState.errors.storeName?.message}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Store description</label>
            <Textarea
              rows={3}
              placeholder="What do you sell?"
              {...form.register("storeDescription")}
            />
            <p className="mt-1 text-xs text-danger">
              {form.formState.errors.storeDescription?.message}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Note to admin (optional)</label>
            <Textarea
              rows={2}
              placeholder="Any extra details for onboarding"
              {...form.register("sellerReason")}
            />
          </div>
        </div>
      ) : null}

      <label className="flex items-start gap-2 rounded-xl border border-border p-3">
        <input type="checkbox" {...form.register("acceptTerms")} className="mt-1" />
        <span className="text-sm text-muted-foreground">
          I agree to the{" "}
          <Link href="/terms-and-conditions" className="font-semibold text-primary hover:underline">
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="font-semibold text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      <p className="text-xs text-danger">{form.formState.errors.acceptTerms?.message}</p>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
      <GoogleAuthButton label="Continue with Google" />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
