"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCart } from "@/contexts/cart-context";
import { useMarket } from "@/contexts/market-context";
import { BANK_DETAILS } from "@/lib/constants";
import { checkoutSchema, type CheckoutSchema } from "@/lib/validations/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice } = useMarket();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const router = useRouter();

  const form = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      coupon_code: "",
      payment_method: "bank_transfer",
      payment_proof_url: "",
      items: [],
    },
  });

  const paymentMethod = form.watch("payment_method");
  const shippingFee = subtotal > 100 ? 0 : subtotal > 0 ? 12 : 0;
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const finalTotal = Math.max(subtotal + shippingFee - discountAmount, 0);

  useEffect(() => {
    setAppliedCoupon((current) => {
      if (!current) return current;
      form.setValue("coupon_code", "");
      return null;
    });
  }, [form, shippingFee, subtotal]);

  useEffect(() => {
    if (!appliedCoupon) return;
    if (couponCode.trim().toUpperCase() === appliedCoupon.code) return;
    setAppliedCoupon(null);
    form.setValue("coupon_code", "");
  }, [appliedCoupon, couponCode, form]);

  useEffect(() => {
    form.setValue(
      "items",
      items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        main_image: item.main_image,
        price: item.price,
        quantity: item.quantity,
      })),
      { shouldValidate: true },
    );
  }, [items, form]);

  const applyCoupon = async () => {
    const normalized = couponCode.trim().toUpperCase();
    if (!normalized) {
      toast.error("Enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: normalized,
          subtotal,
          shippingFee,
        }),
      });

      const body = (await response.json()) as {
        error?: string;
        code?: string;
        discountAmount?: number;
      };

      if (!response.ok || !body.discountAmount || !body.code) {
        throw new Error(body.error || "Invalid coupon code.");
      }

      setAppliedCoupon({
        code: body.code,
        discountAmount: body.discountAmount,
      });
      form.setValue("coupon_code", body.code);
      toast.success("Coupon applied.");
    } catch (error) {
      setAppliedCoupon(null);
      form.setValue("coupon_code", "");
      toast.error(error instanceof Error ? error.message : "Coupon apply failed.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      let paymentProofPath = "";

      if (values.payment_method === "bank_transfer" && proofFile) {
        const data = new FormData();
        data.append("file", proofFile);
        const uploadRes = await fetch("/api/upload/payment-proof", {
          method: "POST",
          body: data,
        });
        if (!uploadRes.ok) {
          throw new Error("Unable to upload payment proof.");
        }
        const uploaded = (await uploadRes.json()) as { path: string };
        paymentProofPath = uploaded.path;
      }

      const payload = {
        ...values,
        coupon_code: appliedCoupon?.code ?? "",
        payment_proof_url: paymentProofPath,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          main_image: item.main_image,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        if (response.status >= 500) {
          toast.error("Database issue detected. Please try again in a moment.");
        }
        throw new Error(body.error || "Checkout failed.");
      }

      const body = (await response.json()) as { orderNumber: string };
      clearCart();
      router.push(`/order-success?order=${body.orderNumber}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <input type="hidden" {...form.register("coupon_code")} />
      <div className="space-y-5">
        <div className="surface p-5">
          <h2 className="text-lg font-bold">Customer Details</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Full name</label>
              <Input {...form.register("customer_name")} />
              <p className="mt-1 text-xs text-danger">
                {form.formState.errors.customer_name?.message}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <Input {...form.register("phone")} />
              <p className="mt-1 text-xs text-danger">
                {form.formState.errors.phone?.message}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input type="email" {...form.register("email")} />
              <p className="mt-1 text-xs text-danger">
                {form.formState.errors.email?.message}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Address</label>
              <Textarea rows={3} {...form.register("address")} />
              <p className="mt-1 text-xs text-danger">
                {form.formState.errors.address?.message}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
              <Textarea rows={3} {...form.register("notes")} />
            </div>
          </div>
        </div>

        <div className="surface p-5">
          <h2 className="text-lg font-bold">Payment Method</h2>
          <div className="mt-4 space-y-3">
            <Select {...form.register("payment_method")}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card Payment (UI only)</option>
              <option value="cod">Cash on Delivery (Coming Soon)</option>
            </Select>

            {paymentMethod === "bank_transfer" ? (
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                <p className="font-semibold">Bank transfer instructions</p>
                <p className="mt-2 text-muted-foreground">
                  Complete transfer and upload proof. Orders remain under review
                  until admin verification.
                </p>
                <ul className="mt-3 space-y-1">
                  <li>Bank: {BANK_DETAILS.bankName}</li>
                  <li>Account Name: {BANK_DETAILS.accountName}</li>
                  <li>Account Number: {BANK_DETAILS.accountNumber}</li>
                  <li>SWIFT: {BANK_DETAILS.swiftCode}</li>
                  <li>Branch: {BANK_DETAILS.branch}</li>
                </ul>
                <div className="mt-3">
                  <label className="mb-1 block font-medium">Payment proof</label>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                      setProofFile(event.target.files?.[0] ?? null)
                    }
                  />
                </div>
              </div>
            ) : null}

            {paymentMethod === "card" ? (
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                <p className="font-semibold">Card details (Coming soon)</p>
                <p className="mt-1 text-muted-foreground">
                  Enter details for preview. Real card charging is disabled until
                  gateway integration.
                </p>
                <div className="mt-3 grid gap-3">
                  <Input placeholder="Cardholder name" />
                  <Input placeholder="Card number" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="MM/YY" />
                    <Input placeholder="CVV" />
                  </div>
                </div>
              </div>
            ) : null}

            {paymentMethod === "cod" ? (
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                Cash on delivery is coming soon and not available yet.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <aside className="surface h-fit p-5">
        <h2 className="text-lg font-bold">Order Summary</h2>
        <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Coupon
          </p>
          <div className="mt-2 flex gap-2">
            <Input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              placeholder="Enter coupon code"
            />
            <Button
              type="button"
              variant="outline"
              onClick={applyCoupon}
              disabled={isApplyingCoupon}
            >
              {isApplyingCoupon ? "Applying..." : "Apply"}
            </Button>
          </div>
          {appliedCoupon ? (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
              {appliedCoupon.code} applied: -{formatPrice(appliedCoupon.discountAmount)}
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Add a valid code to get discount.
            </p>
          )}
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2">
              <span className="line-clamp-1 text-muted-foreground">
                {item.name} x{item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Coupon discount</span>
            <span>{discountAmount > 0 ? `-${formatPrice(discountAmount)}` : "-"}</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(finalTotal)}</span>
          </div>
        </div>
        <Button type="submit" className="mt-5 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Placing order...
            </>
          ) : (
            "Place order"
          )}
        </Button>
      </aside>
    </form>
  );
}
