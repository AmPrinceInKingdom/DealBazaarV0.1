"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type SellerRequestRow = {
  id: string;
  user_id: string;
  store_name: string;
  store_description: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    phone: string | null;
  } | null;
};

export function SellerRequestManager({
  initialRequests,
}: {
  initialRequests: SellerRequestRow[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [noteByRequest, setNoteByRequest] = useState<Record<string, string>>({});
  const [loadingByRequest, setLoadingByRequest] = useState<Record<string, boolean>>({});

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests],
  );

  const review = async (id: string, status: "approved" | "rejected") => {
    setLoadingByRequest((prev) => ({ ...prev, [id]: true }));
    const response = await fetch(`/api/seller-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        review_note: noteByRequest[id] ?? "",
      }),
    });

    setLoadingByRequest((prev) => ({ ...prev, [id]: false }));

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      toast.error(body.error ?? "Unable to update seller request.");
      return;
    }

    setRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
              review_note: noteByRequest[id] ?? null,
            }
          : request,
      ),
    );

    toast.success(status === "approved" ? "Seller request approved." : "Seller request rejected.");
  };

  if (!requests.length) {
    return (
      <section className="surface p-6">
        <h3 className="text-lg font-bold">Seller Requests</h3>
        <p className="mt-2 text-sm text-muted-foreground">No seller requests yet.</p>
      </section>
    );
  }

  return (
    <section className="surface p-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Seller Requests</h3>
        <p className="text-xs text-muted-foreground">{pendingCount} pending</p>
      </div>

      <div className="mt-4 space-y-4">
        {requests.map((request) => (
          <article key={request.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{request.store_name}</p>
              <span className="rounded-full border border-border px-2.5 py-1 text-xs uppercase">
                {request.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              User: {request.user?.full_name || request.user_id} | Phone:{" "}
              {request.user?.phone || "-"}
            </p>
            {request.store_description ? (
              <p className="mt-3 text-sm text-muted-foreground">{request.store_description}</p>
            ) : null}
            {request.reason ? (
              <p className="mt-2 text-sm">
                <span className="font-semibold">Reason:</span> {request.reason}
              </p>
            ) : null}

            {request.status === "pending" ? (
              <div className="mt-4 space-y-3">
                <Textarea
                  rows={2}
                  placeholder="Review note (optional)"
                  value={noteByRequest[request.id] ?? ""}
                  onChange={(event) =>
                    setNoteByRequest((prev) => ({
                      ...prev,
                      [request.id]: event.target.value,
                    }))
                  }
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => review(request.id, "approved")}
                    disabled={Boolean(loadingByRequest[request.id])}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => review(request.id, "rejected")}
                    disabled={Boolean(loadingByRequest[request.id])}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : request.review_note ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Review note: {request.review_note}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
