"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Category } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const createCategory = async () => {
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    setIsSaving(true);
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        slug: slugify(name),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
      }),
    });
    setIsSaving(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      toast.error(body.error ?? "Could not create category.");
      return;
    }

    setName("");
    setDescription("");
    setImageUrl("");
    toast.success("Category created");
    router.refresh();
  };

  const deleteCategory = async (id: string) => {
    const confirmed = window.confirm("Delete this category?");
    if (!confirmed) return;

    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      toast.error(body.error ?? "Delete failed.");
      return;
    }
    toast.success("Category deleted");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="surface p-6">
        <h2 className="text-lg font-bold">Add Category</h2>
        <div className="mt-4 grid gap-3">
          <Input
            placeholder="Category name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            placeholder="Image URL"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Button onClick={createCategory} disabled={isSaving}>
            {isSaving ? "Creating..." : "Create Category"}
          </Button>
        </div>
      </div>

      <div className="surface p-6">
        <h2 className="text-lg font-bold">Existing Categories</h2>
        <div className="mt-4 space-y-3">
          {categories.map((category) => (
            <article
              key={category.id}
              className="flex items-center justify-between rounded-xl border border-border p-3"
            >
              <div>
                <p className="font-semibold">{category.name}</p>
                <p className="text-sm text-muted-foreground">{category.slug}</p>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() => deleteCategory(category.id)}
              >
                Delete
              </Button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
