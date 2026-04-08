import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/domain";
import { SectionHeading } from "@/components/ui/section-heading";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="mt-14 space-y-6">
      <SectionHeading
        title="Shop by Category"
        subtitle="Curated collections built for quality, speed, and value."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={
                  category.image_url ||
                  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80"
                }
                alt={category.name}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/75" />
            <div className="absolute bottom-0 p-4 text-white">
              <h3 className="text-lg font-bold">{category.name}</h3>
              <p className="text-sm text-white/80">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
