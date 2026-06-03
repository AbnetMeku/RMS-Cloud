import Link from "next/link";
import type { ReactNode } from "react";
import type { Role } from "@prisma/client";
import { ChefHat, ClipboardList, CreditCard, LayoutDashboard, LogOut, Shield, Table2 } from "lucide-react";
import { logoutAction } from "@/modules/auth/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const allNav = [
  { href: "/super-admin", label: "Super Admin", icon: Shield, roles: ["SUPER_ADMIN"] as Role[] },
  { href: "/admin", label: "Admin", icon: Table2, roles: ["ADMIN", "MANAGER"] as Role[] },
  { href: "/waiter", label: "Waiter", icon: ClipboardList, roles: ["WAITER"] as Role[] },
  { href: "/kds", label: "KDS", icon: ChefHat, roles: ["KITCHEN"] as Role[] },
  { href: "/cashier", label: "Cashier", icon: CreditCard, roles: ["CASHIER"] as Role[] },
];

export function AppShell({
  title,
  eyebrow,
  children,
  active,
  role,
  userName,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  active?: string;
  role: Role;
  userName: string;
}) {
  const nav = allNav.filter((item) => item.roles.includes(role));

  function isNavActive(href: string) {
    if (!active) return false;
    if (active === href) return true;
    if (href !== "/" && active.startsWith(href)) return true;
    return false;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <Link href={nav[0]?.href ?? "/"} className="flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-600 text-white">
            <ChefHat size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold">RMS Cloud</span>
            <span className="block text-xs text-slate-500">{userName}</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  isActive && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="absolute bottom-5 left-4 right-4">
          <Button type="submit" variant="outline" className="w-full">
            <LogOut size={16} />
            Sign out
          </Button>
        </form>
      </aside>

      <main className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{eyebrow}</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h1>
              </div>
              <form action={logoutAction} className="lg:hidden">
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = isNavActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex min-w-max items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700",
                      isActive && "border-slate-950 bg-slate-950 text-white",
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
