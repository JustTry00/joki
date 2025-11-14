import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserOrders } from "@/lib/actions/order-actions";
import { getUserTokens } from "@/lib/actions/token-actions";
import DashboardClient from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const [orders, tokens] = await Promise.all([
    getUserOrders(session.user.id),
    getUserTokens(session.user.id),
  ]);

  return <DashboardClient session={session} orders={orders} tokens={tokens} />;
}