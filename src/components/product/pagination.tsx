import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  pathname: string;
  searchParams: URLSearchParams;
};

export function Pagination({
  page,
  totalPages,
  pathname,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Link href={buildHref(Math.max(1, page - 1))}>
        <Button variant="outline" disabled={page <= 1}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
      </Link>
      <p className="px-2 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <Link href={buildHref(Math.min(totalPages, page + 1))}>
        <Button variant="outline" disabled={page >= totalPages}>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
