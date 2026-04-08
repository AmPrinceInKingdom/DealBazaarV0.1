import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function MainLoading() {
  return (
    <div className="container-wrap py-20">
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-8">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground">Loading Deal Bazaar...</p>
      </div>
    </div>
  );
}
