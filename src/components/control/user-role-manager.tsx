"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type UserRoleRow = {
  id: string;
  full_name: string | null;
  role: "customer" | "seller" | "admin" | "super_admin";
};

export function UserRoleManager({ users }: { users: UserRoleRow[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();

  const updateRole = async (userId: string, role: string) => {
    setPendingId(userId);
    const response = await fetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setPendingId(null);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      toast.error(body.error ?? "Unable to update role.");
      return;
    }

    toast.success("Role updated");
    router.refresh();
  };

  return (
    <div className="surface overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-4 py-3">{user.full_name || "Unnamed user"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{user.id}</td>
                <td className="px-4 py-3">
                  <Select
                    defaultValue={user.role}
                    onChange={(event) => updateRole(user.id, event.target.value)}
                    disabled={pendingId === user.id}
                    className="max-w-[180px]"
                  >
                    <option value="customer">customer</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                    <option value="super_admin">super_admin</option>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" disabled={pendingId === user.id}>
                    {pendingId === user.id ? "Updating..." : "Saved via select"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
