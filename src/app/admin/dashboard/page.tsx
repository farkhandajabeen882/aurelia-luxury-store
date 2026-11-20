
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminDashboardClient from "./AdminDashboardClient";

async function ProtectedDashboard() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  return <AdminDashboardClient />;
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F4F7FF]">
          <p className="text-lg font-bold text-[#1739BA]">
            Loading AURELIA Dashboard...
          </p>
        </main>
      }
    >
      <ProtectedDashboard />
    </Suspense>
  );
}
