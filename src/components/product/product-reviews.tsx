"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProductReview } from "@/types/domain";
import { cn } from "@/lib/utils";

function formatReviewDate(value?: string) {
  if (!value) {
    return "Just now";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Just now";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ProductReviews({
  productId,
  initialReviews,
  isAuthenticated,
}: {
  productId: string;
  initialReviews: ProductReview[];
  isAuthenticated: boolean;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { averageRating, totalReviews } = useMemo(() => {
    if (reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      averageRating: Number((total / reviews.length).toFixed(1)),
      totalReviews: reviews.length,
    };
  }, [reviews]);

  const uploadReviewImage = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload/review-image", {
      method: "POST",
      body: formData,
    });
    setIsUploading(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      toast.error(body.error ?? "Image upload failed.");
      return;
    }

    const body = (await response.json()) as { url: string };
    setImageUrl(body.url);
    toast.success("Image uploaded.");
  };

  const submitReview = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to submit a review.");
      return;
    }

    if (comment.trim().length < 3) {
      toast.error("Comment must be at least 3 characters.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating,
        comment: comment.trim(),
        image_url: imageUrl || null,
      }),
    });
    setIsSubmitting(false);

    const body = (await response.json()) as {
      error?: string;
      review?: ProductReview;
    };

    if (!response.ok || !body.review) {
      toast.error(body.error ?? "Unable to submit review.");
      return;
    }

    setReviews((prev) => [body.review!, ...prev]);
    setComment("");
    setImageUrl("");
    setRating(5);
    toast.success("Thank you for your review.");
  };

  return (
    <div className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Ratings & Reviews</h2>
        <div className="rounded-xl border border-border px-3 py-2 text-sm">
          <span className="font-bold">{averageRating || 0}</span>/5
          <span className="ml-2 text-muted-foreground">({totalReviews} reviews)</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
        <h3 className="text-base font-semibold">Write a review</h3>
        {!isAuthenticated ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Please{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              login
            </Link>{" "}
            to add rating and comment.
          </p>
        ) : null}

        <div className="mt-3 flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            const active = starValue <= rating;
            return (
              <button
                key={starValue}
                type="button"
                onClick={() => setRating(starValue)}
                disabled={!isAuthenticated}
                className="disabled:cursor-not-allowed"
                aria-label={`Rate ${starValue} star`}
              >
                <Star
                  className={cn("h-5 w-5", active ? "fill-primary text-primary" : "text-muted-foreground")}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-3 space-y-3">
          <Textarea
            rows={3}
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={!isAuthenticated}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Add image (optional)
            </label>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => uploadReviewImage(event.target.files?.[0] ?? null)}
              disabled={!isAuthenticated}
            />
            {isUploading ? (
              <p className="mt-1 text-xs text-muted-foreground">Uploading image...</p>
            ) : null}
            {imageUrl ? (
              <div className="mt-2">
                <Image
                  src={imageUrl}
                  alt="Review preview"
                  width={72}
                  height={72}
                  unoptimized
                  className="h-[72px] w-[72px] rounded-lg border border-border object-cover"
                />
              </div>
            ) : null}
          </div>

          <Button onClick={submitReview} disabled={!isAuthenticated || isSubmitting || isUploading}>
            {isSubmitting ? "Submitting..." : "Submit review"}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first reviewer.</p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  {review.user?.full_name?.trim() || "Verified customer"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatReviewDate(review.created_at)}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`${review.id}-star-${index}`}
                    className={cn(
                      "h-4 w-4",
                      index < review.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                ))}
              </div>

              <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>

              {review.image_url ? (
                <div className="mt-2">
                  <Image
                    src={review.image_url}
                    alt="Review image"
                    width={72}
                    height={72}
                    unoptimized
                    className="h-[72px] w-[72px] rounded-lg border border-border object-cover"
                  />
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
