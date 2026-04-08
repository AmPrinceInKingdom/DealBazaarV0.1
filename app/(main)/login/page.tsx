import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="container-wrap py-14">
      <div className="mx-auto max-w-md surface p-6">
        <h1 className="text-2xl font-black">Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to manage orders, wishlist, and checkout faster.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
