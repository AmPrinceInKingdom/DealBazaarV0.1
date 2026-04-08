import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-wrap py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center">
        <h1 className="text-4xl font-black">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you requested does not exist or has moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <Button>Go home</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Browse products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
