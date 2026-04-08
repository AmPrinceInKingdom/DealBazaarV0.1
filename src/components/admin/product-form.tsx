"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Category, Product } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function specsToText(specs: Record<string, string> = {}) {
  return Object.entries(specs)
    .map(([key, value]) => `${key}:${value}`)
    .join("\n");
}

function parseSpecs(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const [key, ...rest] = line.split(":");
      if (!key || rest.length === 0) return acc;
      acc[key.trim()] = rest.join(":").trim();
      return acc;
    }, {});
}

export function ProductForm({
  categories,
  product,
  mode = "admin",
}: {
  categories: Category[];
  product?: Product | null;
  mode?: "admin" | "seller";
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [sellerId, setSellerId] = useState(product?.seller_id ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [oldPrice, setOldPrice] = useState(String(product?.old_price ?? ""));
  const [stock, setStock] = useState(String(product?.stock_quantity ?? ""));
  const [sku, setSku] = useState(product?.sku ?? "");
  const [shortDescription, setShortDescription] = useState(
    product?.short_description ?? "",
  );
  const [fullDescription, setFullDescription] = useState(
    product?.full_description ?? "",
  );
  const [mainImage, setMainImage] = useState(product?.main_image ?? "");
  const [gallery, setGallery] = useState(
    product?.gallery_images.join("\n") ?? "",
  );
  const [videoUrl, setVideoUrl] = useState(product?.video_url ?? "");
  const [featured, setFeatured] = useState(Boolean(product?.featured));
  const [specifications, setSpecifications] = useState(
    specsToText(product?.specifications),
  );

  const stockStatus = useMemo(() => {
    const quantity = Number(stock);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return "out_of_stock";
    }
    if (quantity < 10) {
      return "low_stock";
    }
    return "in_stock";
  }, [stock]);

  const saveProduct = async () => {
    if (categories.length === 0) {
      toast.error("Create at least one category before adding products.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    const galleryImages = gallery
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 5);

    const resolvedGalleryImages =
      galleryImages.length > 0
        ? galleryImages
        : mainImage
          ? [mainImage]
          : [];

    if (!mainImage) {
      toast.error("Please provide a main image URL or upload a main image file.");
      return;
    }

    if (resolvedGalleryImages.length === 0) {
      toast.error("Please provide at least one gallery image.");
      return;
    }

    const payload = {
      name,
      slug,
      category_id: categoryId,
      seller_id: sellerId || null,
      price: Number(price),
      old_price: oldPrice ? Number(oldPrice) : null,
      stock_quantity: Number(stock),
      stock_status: stockStatus,
      sku,
      short_description: shortDescription,
      full_description: fullDescription,
      specifications: parseSpecs(specifications),
      main_image: mainImage,
      gallery_images: resolvedGalleryImages,
      video_url: videoUrl || null,
      featured,
      related_product_ids: product?.related_product_ids ?? [],
    };

    setIsSaving(true);
    const response = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
      method: product ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    setIsSaving(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      toast.error(body.error ?? "Failed to save product.");
      return;
    }

    toast.success(product ? "Product updated" : "Product created");
    router.push(mode === "seller" ? "/seller/products" : "/admin/products");
    router.refresh();
  };

  const uploadMainImage = async (file: File | null) => {
    if (!file) return;
    setIsUploadingMain(true);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload/product-image", {
      method: "POST",
      body: formData,
    });
    setIsUploadingMain(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      toast.error(body.error ?? "Main image upload failed.");
      return;
    }

    const body = (await response.json()) as { url: string };
    setMainImage(body.url);
    toast.success("Main image uploaded");
  };

  const uploadGalleryImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploadingGallery(true);
    const urls: string[] = [];

    for (const file of Array.from(files).slice(0, 5)) {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload/product-image", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        toast.error(body.error ?? "Gallery upload failed.");
        continue;
      }
      const body = (await response.json()) as { url: string };
      urls.push(body.url);
    }

    setIsUploadingGallery(false);
    if (urls.length) {
      setGallery(urls.slice(0, 5).join("\n"));
      toast.success("Gallery images uploaded");
    }
  };

  return (
    <div className="surface p-6">
      <h2 className="text-xl font-bold">
        {product ? "Edit Product" : "Add New Product"}
      </h2>
      <div className="mt-4 grid gap-4">
        {categories.length === 0 ? (
          <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            No categories found. Create categories first from the admin panel.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {mode === "admin" ? (
            <Input
              placeholder="Seller user ID (optional)"
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
            />
          ) : null}
          <Input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
          <Input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Old Price"
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Stock Quantity"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <Input
            placeholder="Video URL (optional)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <Textarea
          placeholder="Short description"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
        <Textarea
          rows={6}
          placeholder="Full description"
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
        />
        <Input
          placeholder="Main image URL"
          value={mainImage}
          onChange={(e) => setMainImage(e.target.value)}
        />
        <div className="grid gap-2">
          <label className="text-sm font-medium">
            Upload main image (file)
          </label>
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => uploadMainImage(event.target.files?.[0] ?? null)}
          />
          {isUploadingMain ? (
            <p className="text-xs text-muted-foreground">Uploading main image...</p>
          ) : null}
        </div>
        <Textarea
          rows={5}
          placeholder="Gallery image URLs (one per line, max 5)"
          value={gallery}
          onChange={(e) => setGallery(e.target.value)}
        />
        <div className="grid gap-2">
          <label className="text-sm font-medium">
            Upload gallery images (up to 5)
          </label>
          <Input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => uploadGalleryImages(event.target.files)}
          />
          {isUploadingGallery ? (
            <p className="text-xs text-muted-foreground">Uploading gallery...</p>
          ) : null}
        </div>
        <Textarea
          rows={5}
          placeholder="Specifications (format: Key:Value, one per line)"
          value={specifications}
          onChange={(e) => setSpecifications(e.target.value)}
        />

        {mode === "admin" ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Mark as featured product
          </label>
        ) : (
          <p className="text-xs text-muted-foreground">
            Featured placement is managed by admins.
          </p>
        )}

        <Button onClick={saveProduct} disabled={isSaving}>
          {isSaving ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
