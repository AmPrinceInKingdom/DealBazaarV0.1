import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="container-wrap py-14">
      <div className="mx-auto max-w-md surface p-6">
        <h1 className="text-2xl font-black">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the password recovery link from your email, then set a new password here.
        </p>
        <div className="mt-6">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
