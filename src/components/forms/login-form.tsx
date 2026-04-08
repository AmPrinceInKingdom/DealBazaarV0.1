"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { loginSchema, type LoginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { GoogleAuthButton } from "@/components/forms/google-auth-button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(values);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data: authUser } = await supabase.auth.getUser();
    const userId = authUser.user?.id;
    let target = "/account";

    if (next) {
      target = next;
    } else if (userId) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (profile?.role === "admin") {
        target = "/admin";
      } else if (profile?.role === "super_admin") {
        target = "/control";
      } else if (profile?.role === "seller") {
        target = "/seller";
      }
    }

    toast.success("Login successful");
    router.push(target);
    router.refresh();
  });

  const sendResetPasswordLink = async () => {
    const email = form.getValues("email").trim();
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }

    setIsSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSendingReset(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password reset link sent to your email.");
  };

  const resendVerificationCode = async () => {
    const email = form.getValues("email").trim();
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }

    setIsResendingVerification(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });
    setIsResendingVerification(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Verification code sent again. Check your inbox.");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input type="email" {...form.register("email")} />
        <p className="mt-1 text-xs text-danger">{form.formState.errors.email?.message}</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <Input type="password" {...form.register("password")} />
        <p className="mt-1 text-xs text-danger">{form.formState.errors.password?.message}</p>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={sendResetPasswordLink}
            disabled={isSendingReset}
            className="text-xs font-semibold text-primary hover:underline disabled:opacity-60"
          >
            {isSendingReset ? "Sending reset link..." : "Forgot password?"}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            Signing in...
          </>
        ) : (
          "Login"
        )}
      </Button>
      <GoogleAuthButton label="Continue with Google" />
      <button
        type="button"
        onClick={resendVerificationCode}
        disabled={isResendingVerification}
        className="w-full text-xs font-semibold text-primary hover:underline disabled:opacity-60"
      >
        {isResendingVerification
          ? "Sending verification..."
          : "Resend verification code"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
