"use client";

import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.8 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.5a4.8 4.8 0 0 1-2.1 3.1v2.6h3.5c2-1.9 2.9-4.6 2.9-7.7Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 5-.9 6.6-2.5l-3.5-2.6c-1 .7-2.2 1.1-3.1 1.1-2.4 0-4.4-1.6-5.1-3.8H3.3v2.7A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.9 14.2a6 6 0 0 1 0-4V7.5H3.3a10 10 0 0 0 0 9.4l3.6-2.7Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.7 5.5l3.6 2.7c.7-2.2 2.7-4 5.1-4Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  const loginWithGoogle = async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/account`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={loginWithGoogle}
    >
      <GoogleIcon />
      <span>{label}</span>
    </Button>
  );
}
