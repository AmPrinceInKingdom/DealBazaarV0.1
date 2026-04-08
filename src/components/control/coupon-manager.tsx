"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import type { Coupon } from "@/types/domain";

type CouponFormValues = {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_total: string;
  max_discount_amount: string;
  usage_limit: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

const initialFormValues: CouponFormValues = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  min_order_total: "0",
  max_discount_amount: "",
  usage_limit: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

function toIsoOrNull(value: string) {
  if (!value.trim()) return null;
  return new Date(value).toISOString();
}

export function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [formValues, setFormValues] = useState<CouponFormValues>(initialFormValues);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingCouponId, setPendingCouponId] = useState<string | null>(null);
  const router = useRouter();

  const totalActiveCoupons = useMemo(
    () => coupons.filter((coupon) => coupon.is_active).length,
    [coupons],
  );

  const handleCreateCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch("/api/control/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formValues.code,
          description: formValues.description,
          discount_type: formValues.discount_type,
          discount_value: Number(formValues.discount_value),
          min_order_total: Number(formValues.min_order_total || "0"),
          max_discount_amount: formValues.max_discount_amount
            ? Number(formValues.max_discount_amount)
            : null,
          usage_limit: formValues.usage_limit ? Number(formValues.usage_limit) : null,
          starts_at: toIsoOrNull(formValues.starts_at),
          ends_at: toIsoOrNull(formValues.ends_at),
          is_active: formValues.is_active,
        }),
      });

      const body = (await response.json()) as { error?: string; coupon?: Coupon };
      if (!response.ok || !body.coupon) {
        throw new Error(body.error ?? "Unable to create coupon.");
      }

      setCoupons((prev) => [body.coupon!, ...prev]);
      setFormValues(initialFormValues);
      toast.success("Coupon created.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create coupon.");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    setPendingCouponId(coupon.id);
    try {
      const response = await fetch(`/api/control/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });

      const body = (await response.json()) as { error?: string; coupon?: Coupon };
      if (!response.ok || !body.coupon) {
        throw new Error(body.error ?? "Unable to update coupon.");
      }

      setCoupons((prev) =>
        prev.map((row) => (row.id === coupon.id ? body.coupon! : row)),
      );
      toast.success("Coupon updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update coupon.");
    } finally {
      setPendingCouponId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface p-6">
        <h2 className="text-xl font-bold">Create Coupon</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Super admin only. Active coupons: {totalActiveCoupons}
        </p>

        <form onSubmit={handleCreateCoupon} className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Coupon code</label>
            <Input
              value={formValues.code}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))
              }
              placeholder="NEWYEAR20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Discount type</label>
            <Select
              value={formValues.discount_type}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  discount_type: event.target.value as "percentage" | "fixed",
                }))
              }
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Discount value</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formValues.discount_value}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, discount_value: event.target.value }))
              }
              placeholder={formValues.discount_type === "percentage" ? "10" : "5.00"}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Minimum order total</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formValues.min_order_total}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, min_order_total: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Max discount amount (optional)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formValues.max_discount_amount}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  max_discount_amount: event.target.value,
                }))
              }
              placeholder="25.00"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Usage limit (optional)</label>
            <Input
              type="number"
              min="1"
              step="1"
              value={formValues.usage_limit}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, usage_limit: event.target.value }))
              }
              placeholder="100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Starts at (optional)</label>
            <Input
              type="datetime-local"
              value={formValues.starts_at}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, starts_at: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ends at (optional)</label>
            <Input
              type="datetime-local"
              value={formValues.ends_at}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, ends_at: event.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Input
              value={formValues.description}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Campaign details"
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-border p-3">
            <p className="text-sm text-muted-foreground">
              Set coupon as active right after create.
            </p>
            <Button
              type="button"
              variant={formValues.is_active ? "default" : "outline"}
              onClick={() =>
                setFormValues((prev) => ({ ...prev, is_active: !prev.is_active }))
              }
            >
              {formValues.is_active ? "Active" : "Inactive"}
            </Button>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create coupon"}
            </Button>
          </div>
        </form>
      </section>

      <section className="surface overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/35">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Minimum</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{coupon.code}</p>
                    {coupon.description ? (
                      <p className="text-xs text-muted-foreground">{coupon.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : formatCurrency(coupon.discount_value)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(coupon.min_order_total)}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.used_count}
                    {coupon.usage_limit ? ` / ${coupon.usage_limit}` : " / Unlimited"}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.is_active ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-500/15 px-2 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingCouponId === coupon.id}
                      onClick={() => toggleCouponStatus(coupon)}
                    >
                      {pendingCouponId === coupon.id
                        ? "Updating..."
                        : coupon.is_active
                          ? "Disable"
                          : "Enable"}
                    </Button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No coupons created yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
