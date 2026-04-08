import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminLoading() {
  return (
    <div className="container-wrap py-20">
      <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground">Loading admin panel...</p>
      </div>
    </div>
  );
}
