import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { listActiveTenantsForPinLogin } from "@/lib/auth";
import { getServerSession } from "@/lib/server-session";
import { getRoleHomePath } from "@/lib/session-constants";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getServerSession();
  if (session) {
    redirect(getRoleHomePath(session.role));
  }

  const tenants = await listActiveTenantsForPinLogin();
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <LoginForm tenants={tenants} error={params.error} />
    </div>
  );
}
