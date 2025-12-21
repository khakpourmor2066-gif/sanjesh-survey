import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin_session")?.value === "1";
  if (!isAuthed) {
    redirect("/admin/login");
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader />
      {children}
    </div>
  );
}
