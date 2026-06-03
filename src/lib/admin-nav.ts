import type { Permission } from "@prisma/client";
import type { SessionData } from "@/lib/session-constants";
import {
  BarChart3,
  ChefHat,
  LayoutDashboard,
  Package,
  Receipt,
  Table2,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
  adminOnly?: boolean;
};

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users, permission: "MANAGE_USERS" },
  { href: "/admin/tables", label: "Tables", icon: Table2, permission: "MANAGE_TABLES" },
  { href: "/admin/stations", label: "Stations", icon: ChefHat, permission: "MANAGE_STATIONS" },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed, permission: "MANAGE_MENU" },
  { href: "/admin/inventory", label: "Inventory", icon: Package, permission: "MANAGE_INVENTORY" },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt, permission: "MANAGE_EXPENSES" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, permission: "VIEW_REPORTS" },
];

export function getAdminNav(session: SessionData): AdminNavItem[] {
  if (session.role === "ADMIN") return adminNav;
  return adminNav.filter((item) => {
    if (!item.permission) return true;
    return session.permissions.includes(item.permission);
  });
}

export function canAccessAdminPath(session: SessionData, pathname: string): boolean {
  const item = adminNav.find((nav) => nav.href === pathname || (nav.href !== "/admin" && pathname.startsWith(nav.href)));
  if (!item) return pathname === "/admin" || pathname.startsWith("/admin/");
  if (session.role === "ADMIN") return true;
  if (!item.permission) return true;
  return session.permissions.includes(item.permission);
}
