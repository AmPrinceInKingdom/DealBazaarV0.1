import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <div className="container-wrap py-14">
      <div className="mx-auto max-w-2xl surface p-6">
        <h1 className="text-2xl font-black">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join Deal Bazaar as a customer or seller.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
