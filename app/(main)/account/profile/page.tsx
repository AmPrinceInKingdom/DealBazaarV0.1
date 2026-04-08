import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";
import { getAuthContext } from "@/lib/auth";

export default async function ProfilePage() {
  const auth = await getAuthContext();
  if (!auth) {
    notFound();
  }

  return (
    <ProfileForm
      profile={auth.profile}
      userId={auth.user.id}
      email={auth.user.email}
    />
  );
}
