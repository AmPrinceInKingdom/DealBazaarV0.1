"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { LocaleCode } from "@/lib/i18n";
import type { CurrencyCode } from "@/lib/market";
import type { UserProfile } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForm({
  profile,
  userId,
  email,
}: {
  profile: UserProfile | null;
  userId: string;
  email?: string;
}) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [preferredLanguage, setPreferredLanguage] = useState<LocaleCode>(
    (profile?.preferred_language as LocaleCode) ?? "en",
  );
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>(
    (profile?.preferred_currency as CurrencyCode) ?? "USD",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [requestStoreName, setRequestStoreName] = useState("");
  const [requestStoreDescription, setRequestStoreDescription] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [sellerRequest, setSellerRequest] = useState<{
    id: string;
    status: "pending" | "approved" | "rejected";
    review_note: string | null;
    created_at: string;
  } | null>(null);

  useEffect(() => {
    if (profile?.role !== "customer") {
      return;
    }

    const loadRequest = async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        return;
      }

      const { data } = await supabase
        .from("seller_requests")
        .select("id, status, review_note, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      setSellerRequest(data?.[0] ?? null);
    };

    void loadRequest();
  }, [profile?.role, userId]);

  const saveProfile = async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase is not configured.");
      return;
    }

    setIsSaving(true);
    const updatePayload = {
      full_name: fullName,
      phone,
      preferred_language: preferredLanguage,
      preferred_currency: preferredCurrency,
    };

    const { data: updatedRows, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", userId)
      .select("id");

    if (!error && (!updatedRows || updatedRows.length === 0)) {
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        full_name: fullName,
        phone,
        role: profile?.role ?? "customer",
        preferred_language: preferredLanguage,
        preferred_currency: preferredCurrency,
      });

      setIsSaving(false);
      if (insertError) {
        toast.error(insertError.message);
        return;
      }

      toast.success("Profile updated");
      return;
    }

    setIsSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Profile updated");
  };

  const submitSellerRequest = async () => {
    if (profile?.role !== "customer") {
      return;
    }

    if (requestStoreName.trim().length < 2) {
      toast.error("Please enter a valid store name.");
      return;
    }

    if (requestStoreDescription.trim().length < 10) {
      toast.error("Please add a short store description (at least 10 characters).");
      return;
    }

    setIsSubmittingRequest(true);
    const response = await fetch("/api/seller-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        store_name: requestStoreName,
        store_description: requestStoreDescription,
        reason: requestReason,
      }),
    });
    setIsSubmittingRequest(false);

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      toast.error(body.error ?? "Unable to submit seller request.");
      return;
    }

    toast.success("Seller request submitted. Admin review is pending.");
    setRequestStoreName("");
    setRequestStoreDescription("");
    setRequestReason("");
    setSellerRequest({
      id: "pending",
      status: "pending",
      review_note: null,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="surface p-6">
      <h2 className="text-xl font-bold">Profile Information</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <Input value={email ?? ""} disabled />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Preferred language</label>
            <Select
              value={preferredLanguage}
              onChange={(event) =>
                setPreferredLanguage(event.target.value as LocaleCode)
              }
            >
              <option value="en">English</option>
              <option value="si">Sinhala</option>
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="ar">Arabic</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Preferred currency</label>
            <Select
              value={preferredCurrency}
              onChange={(event) =>
                setPreferredCurrency(event.target.value as CurrencyCode)
              }
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="LKR">LKR</option>
              <option value="INR">INR</option>
              <option value="JPY">JPY</option>
              <option value="AUD">AUD</option>
              <option value="CAD">CAD</option>
              <option value="AED">AED</option>
              <option value="SGD">SGD</option>
              <option value="CNY">CNY</option>
              <option value="MYR">MYR</option>
            </Select>
          </div>
        </div>
        <Button onClick={saveProfile} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save profile"}
        </Button>
      </div>

      {profile?.role === "customer" ? (
        <div className="mt-6 rounded-xl border border-border p-4">
          <h3 className="text-base font-bold">Seller access request</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Want to start selling? Submit a request and admin can approve your seller
            access.
          </p>

          {sellerRequest ? (
            <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 text-sm">
              <p>
                Current status:{" "}
                <span className="font-semibold uppercase">{sellerRequest.status}</span>
              </p>
              {sellerRequest.review_note ? (
                <p className="mt-1 text-muted-foreground">
                  Admin note: {sellerRequest.review_note}
                </p>
              ) : null}
            </div>
          ) : null}

          {!sellerRequest || sellerRequest.status !== "pending" ? (
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Store name</label>
                <Input
                  value={requestStoreName}
                  onChange={(event) => setRequestStoreName(event.target.value)}
                  placeholder="Your store name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Store description</label>
                <Textarea
                  rows={3}
                  value={requestStoreDescription}
                  onChange={(event) => setRequestStoreDescription(event.target.value)}
                  placeholder="Tell us what you plan to sell"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Note to admin (optional)
                </label>
                <Textarea
                  rows={2}
                  value={requestReason}
                  onChange={(event) => setRequestReason(event.target.value)}
                  placeholder="Any additional details"
                />
              </div>
              <Button onClick={submitSellerRequest} disabled={isSubmittingRequest}>
                {isSubmittingRequest ? "Submitting..." : "Request seller access"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
