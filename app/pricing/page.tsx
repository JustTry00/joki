import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTiers } from "@/lib/actions/tier-actions";
import PricingClient from "@/components/pricing/hero";

export default async function PricingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const tiers = await getTiers();

  return <PricingClient session={session} tiers={tiers} />;

}