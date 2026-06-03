import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { getRoleHomePath } from "@/lib/session-constants";

export default async function Home() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  redirect(getRoleHomePath(session.role));
}
