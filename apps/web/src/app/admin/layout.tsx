import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentAppUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Server-side gate: non-admins never receive the admin page. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAppUser();
  if (!user?.isAdmin) redirect("/dashboard");
  return <>{children}</>;
}
