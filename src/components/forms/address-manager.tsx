"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Address } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DraftAddress = Omit<Address, "id" | "user_id" | "created_at">;

const emptyAddress: DraftAddress = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  is_default: false,
};

export function AddressManager({
  initialAddresses,
  userId,
}: {
  initialAddresses: Address[];
  userId: string;
}) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [draft, setDraft] = useState<DraftAddress>(emptyAddress);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase is not configured.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...draft,
      user_id: userId,
      is_default: Boolean(draft.is_default),
    };

    const { data, error } = await supabase
      .from("addresses")
      .insert(payload)
      .select("*")
      .single();
    setIsSubmitting(false);

    if (error || !data) {
      toast.error(error?.message || "Could not save address.");
      return;
    }

    setAddresses((prev) => [data, ...prev]);
    setDraft(emptyAddress);
    toast.success("Address saved");
  };

  const handleDelete = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase is not configured.");
      return;
    }

    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    toast.success("Address removed");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="surface p-6">
        <h2 className="text-lg font-bold">Add Address</h2>
        <div className="mt-4 space-y-3">
          <Input
            placeholder="Full name"
            value={draft.full_name}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, full_name: event.target.value }))
            }
          />
          <Input
            placeholder="Phone"
            value={draft.phone}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, phone: event.target.value }))
            }
          />
          <Input
            placeholder="Address line 1"
            value={draft.address_line_1}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, address_line_1: event.target.value }))
            }
          />
          <Input
            placeholder="Address line 2"
            value={draft.address_line_2 ?? ""}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, address_line_2: event.target.value }))
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="City"
              value={draft.city}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, city: event.target.value }))
              }
            />
            <Input
              placeholder="State"
              value={draft.state ?? ""}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, state: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Postal code"
              value={draft.postal_code ?? ""}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, postal_code: event.target.value }))
              }
            />
            <Input
              placeholder="Country"
              value={draft.country}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, country: event.target.value }))
              }
            />
          </div>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save address"}
          </Button>
        </div>
      </div>

      <div className="surface p-6">
        <h2 className="text-lg font-bold">Saved Addresses</h2>
        <div className="mt-4 space-y-3">
          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No addresses saved yet. Add your first shipping address.
            </p>
          ) : (
            addresses.map((address) => (
              <article key={address.id} className="rounded-xl border border-border p-3">
                <p className="font-semibold">{address.full_name}</p>
                <p className="text-sm text-muted-foreground">{address.phone}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {address.address_line_1}
                  {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                  , {address.city}, {address.country}
                </p>
                <button
                  className="mt-2 text-sm text-danger hover:underline"
                  onClick={() => handleDelete(address.id)}
                >
                  Delete
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
