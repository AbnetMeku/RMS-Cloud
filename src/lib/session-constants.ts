export const SESSION_COOKIE = "rms_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SessionData = {
  userId: string;
  tenantId: string | null;
  role: import("@prisma/client").Role;
  name: string;
  username: string;
  permissions: import("@prisma/client").Permission[];
};

export function getRoleHomePath(role: import("@prisma/client").Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/super-admin";
    case "ADMIN":
    case "MANAGER":
      return "/admin";
    case "WAITER":
      return "/waiter";
    case "KITCHEN":
      return "/kds";
    case "CASHIER":
      return "/cashier";
    default:
      return "/login";
  }
}
